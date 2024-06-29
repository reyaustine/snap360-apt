import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase'; // Adjust the path to your firebase configuration file
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Navbar from '../Navbar/Navbar';
import BookingForm from '../BookingForm/BookingForm'; // Adjust the path as necessary
import BookingList from '../BookingList/BookingList'; // Import the BookingList component
import './Dashboard.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [currentMonthCount, setCurrentMonthCount] = useState(0);
  const [nextMonthCount, setNextMonthCount] = useState(0);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Add state for selected date
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [removePhotoIndex, setRemovePhotoIndex] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [largePhoto, setLargePhoto] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [userInputCaptcha, setUserInputCaptcha] = useState('');

  const generateCaptcha = () => {
    const value = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaValue(value);
    return value;
  };

  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const data = [];
    let currentMonthCount = 0;
    let nextMonthCount = 0;

    querySnapshot.forEach(doc => {
      const appointmentData = doc.data();
      console.log('Processing document:', appointmentData);

      if (appointmentData.deleted) {
        return;
      }

      let fullName = appointmentData.fullName || appointmentData.clientName || 'No Name';
      let aptDate;

      if (appointmentData.aptDate) {
        aptDate = appointmentData.aptDate.toDate ? appointmentData.aptDate.toDate() : new Date(appointmentData.aptDate);
      } else if (appointmentData.eventDate && appointmentData.eventTime) {
        aptDate = moment(`${appointmentData.eventDate} ${appointmentData.eventTime}`, 'YYYY-MM-DD HH:mm').toDate();
      } else {
        console.error("Invalid appointment data:", appointmentData);
        return;
      }

      let status = appointmentData.status || appointmentData.bookingStatus || '';
      console.log(aptDate, fullName);

      if (status.toLowerCase() !== 'done') {
        const event = {
          id: doc.id,
          title: fullName,
          start: aptDate,
          end: moment(aptDate).add(1, 'hours').toDate(),
        };
        data.push(event);

        const eventMonth = moment(event.start).month();
        const currentMonth = moment().month();
        const nextMonth = moment().add(1, 'month').month();

        if (eventMonth === currentMonth) {
          currentMonthCount++;
        } else if (eventMonth === nextMonth) {
          nextMonthCount++;
        }
      }
    });

    console.log('Final event data:', data);
    setEvents(data);
    setCurrentMonthCount(currentMonthCount);
    setNextMonthCount(nextMonthCount);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleEventClick = async (event) => {
    const docRef = doc(db, 'appointments', event.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const eventData = docSnap.data();
      const eventDetails = {
        id: event.id,
        clientName: eventData.clientName || eventData.fullName || 'No Name',
        clientNumber: eventData.clientNumber || eventData.contactNo || '',
        eventDate: eventData.eventDate ? moment(eventData.eventDate).format('YYYY-MM-DD') : moment(eventData.aptDate.toDate ? eventData.aptDate.toDate() : eventData.aptDate).format('YYYY-MM-DD'),
        eventTime: eventData.eventTime || '',
        bookingStatus: eventData.bookingStatus || eventData.status || '',
        paymentStatus: eventData.paymentStatus || '',
        paidAmount: eventData.paidAmount || eventData.dpAmount || '',
        paidVia: eventData.paidVia || '',
        paymentProof: Array.isArray(eventData.paymentProof) ? eventData.paymentProof : eventData.paymentProof ? [eventData.paymentProof] : [],
        venue: eventData.venue || '',
        otherDetails: eventData.otherDetails || eventData.bookingDetails || '',
        service: eventData.service || '',
        rate: eventData.rate || '',
        savedBy: eventData.savedBy || '',
        savedDate: eventData.savedDate && eventData.savedDate.toDate ? moment(eventData.savedDate.toDate()).format('MMMM Do YYYY, h:mm:ss a') : '',
        updateDate: eventData.updateDate && eventData.updateDate.toDate ? moment(eventData.updateDate.toDate()).format('MMMM Do YYYY, h:mm:ss a') : '',
        updatedBy: eventData.updatedBy || '',
      };

      setSelectedEvent(eventDetails);
      setShowModal(true);
    } else {
      console.log("No such document!");
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(moment(start).format('YYYY-MM-DD'));
    setActiveTab('bookingForm');
  };

  const handleCloseModal = () => setShowModal(false);

  const handleTabChange = (tab) => {
    if (tab === 'bookings') {
      fetchAppointments(); // Refresh the calendar events
    }
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedEvent({ ...selectedEvent, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedEvent({ ...selectedEvent, paymentProof: [...selectedEvent.paymentProof, e.target.files[0]] });
  };

  const handleRemovePhoto = (index) => {
    setRemovePhotoIndex(index);
    setShowRemoveConfirmation(true);
  };

  const confirmRemovePhoto = () => {
    if (removePhotoIndex !== null) {
      const updatedProofs = [...selectedEvent.paymentProof];
      updatedProofs.splice(removePhotoIndex, 1);
      setSelectedEvent({ ...selectedEvent, paymentProof: updatedProofs });
    }
    setShowRemoveConfirmation(false);
  };

  const handleUpdateEvent = async () => {
    setShowConfirmationModal(true);
  };

  const confirmUpdateEvent = async () => {
    setIsUpdating(true);
    if (!selectedEvent) return;

    const eventRef = doc(db, 'appointments', selectedEvent.id);
    const newProofs = [];

    for (let file of selectedEvent.paymentProof) {
      if (file instanceof File) {
        const proofRef = ref(storage, `paymentProofs/${selectedEvent.id}_${Date.now()}`);
        await uploadBytes(proofRef, file);
        const proofURL = await getDownloadURL(proofRef);
        newProofs.push(proofURL);
      } else {
        newProofs.push(file);
      }
    }

    await updateDoc(eventRef, {
      ...selectedEvent,
      paymentProof: newProofs,
      updateDate: serverTimestamp(),
      updatedBy: auth.currentUser.email,
    });

    setIsUpdating(false);
    setUpdateSuccess(true);
    setTimeout(() => {
      setShowConfirmationModal(false);
      setUpdateSuccess(false);
      fetchAppointments(); // Refresh the event list
    }, 2000);
  };

  const handleDeleteEvent = () => {
    setCaptchaValue(generateCaptcha());
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteEvent = async () => {
    if (userInputCaptcha !== captchaValue) {
      alert('CAPTCHA does not match. Please try again.');
      return;
    }

    const eventRef = doc(db, 'appointments', selectedEvent.id);

    await updateDoc(eventRef, {
      deleted: serverTimestamp(),
      deletedBy: auth.currentUser.email,
    });

    setShowDeleteConfirmation(false);
    setShowModal(false);
    fetchAppointments(); // Refresh the event list
  };

  const handlePhotoClick = (photo) => {
    setLargePhoto(photo);
  };

  const handleCloseLargePhoto = () => {
    setLargePhoto(null);
  };

  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card className="mt-4">
                <Card.Body>
                  <div className="tab-navigation">
                    <Button
                      variant="link"
                      onClick={() => handleTabChange('bookings')}
                      className={activeTab === 'bookings' ? 'active' : ''}
                    >
                      Calendar
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleTabChange('bookingForm')}
                      className={activeTab === 'bookingForm' ? 'active' : ''}
                    >
                      Booking Form
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleTabChange('bookingList')}
                      className={activeTab === 'bookingList' ? 'active' : ''}
                    >
                      Booking List
                    </Button>
                  </div>
                  <div className="form-content mt-4">
                    {activeTab === 'bookings' && (
                      <>
                        <Row>
                          <Col md={12}>
                            <h5>Upcoming Bookings</h5>
                            <div style={{ overflowX: 'auto' }}>
                              <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                selectable
                                onSelectSlot={handleSelectSlot}
                                eventPropGetter={(event) => {
                                  const isPast = moment(event.start).isBefore(moment(), 'day');
                                  const isSelected = moment(event.start).isSame(moment(), 'day');
                                  return {
                                    className: isSelected ? 'selected-event' : isPast ? 'past-event' : '',
                                  };
                                }}
                                onSelectEvent={handleEventClick}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row className="event-count">
                          <Col xs={12}>
                            <p>Total Events this Month: {currentMonthCount}</p>
                            <p>Total Events next Month: {nextMonthCount}</p>
                          </Col>
                        </Row>
                      </>
                    )}
                    {activeTab === 'bookingForm' && <BookingForm selectedDate={selectedDate} />}
                    {activeTab === 'bookingList' && <BookingList />}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <Modal show={showModal} onHide={handleCloseModal} dialogClassName="event-details-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              Event Details
              <div style={{ fontSize: '0.8em', color: 'gray' }}>
                updated by: {selectedEvent?.updatedBy || 'N/A'} <br />
                updated: {selectedEvent?.updateDate || 'N/A'}
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedEvent && (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Client Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="clientName"
                        value={selectedEvent.clientName}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Client Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="clientNumber"
                        value={selectedEvent.clientNumber}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Event Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="eventDate"
                        value={selectedEvent.eventDate}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Event Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="eventTime"
                        value={selectedEvent.eventTime}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Booking Status</Form.Label>
                      <Form.Control
                        type="text"
                        name="bookingStatus"
                        value={selectedEvent.bookingStatus}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Status</Form.Label>
                      <Form.Control
                        type="text"
                        name="paymentStatus"
                        value={selectedEvent.paymentStatus}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Paid Amount</Form.Label>
                      <Form.Control
                        type="number"
                        name="paidAmount"
                        value={selectedEvent.paidAmount}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Paid Via</Form.Label>
                      <Form.Control
                        type="text"
                        name="paidVia"
                        value={selectedEvent.paidVia}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Service Availed</Form.Label>
                  <Form.Control
                    type="text"
                    name="service"
                    value={selectedEvent.service}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Rate</Form.Label>
                  <Form.Control
                    type="number"
                    name="rate"
                    value={selectedEvent.rate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Venue</Form.Label>
                  <Form.Control
                    type="text"
                    name="venue"
                    value={selectedEvent.venue}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Other Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="otherDetails"
                    value={selectedEvent.otherDetails}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Proof</Form.Label>
                  <Form.Control
                    type="file"
                    name="paymentProof"
                    onChange={handleFileChange}
                  />
                </Form.Group>
                {selectedEvent.paymentProof.length > 0 && (
                  <div className="d-flex justify-content-between">
                    {selectedEvent.paymentProof.map((proof, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={proof}
                          alt="Payment Proof"
                          style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                          onClick={() => handlePhotoClick(proof)}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdateEvent}>
              Update Event
            </Button>
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this event?</p>
            <Form.Group className="mb-3">
              <Form.Label>Enter the CAPTCHA: {captchaValue}</Form.Label>
              <Form.Control
                type="text"
                value={userInputCaptcha}
                onChange={(e) => setUserInputCaptcha(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteEvent}>
              Confirm Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Update</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isUpdating ? (
              <div className="d-flex justify-content-center align-items-center">
                <Spinner animation="border" role="status">
                  <span className="sr-only">Updating...</span>
                </Spinner>
              </div>
            ) : updateSuccess ? (
              <div className="d-flex justify-content-center align-items-center">
                <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: 'green' }}></i>
                <p>Update Successful</p>
              </div>
            ) : (
              <p>Are you sure you want to update this event?</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            {!isUpdating && !updateSuccess && (
              <>
                <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={confirmUpdateEvent}>
                  Confirm
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>

        <Modal show={showRemoveConfirmation} onHide={() => setShowRemoveConfirmation(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Remove Photo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to remove this photo?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRemoveConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmRemovePhoto}>
              Remove
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={largePhoto !== null} onHide={handleCloseLargePhoto}>
          <Modal.Body className="text-center">
            {largePhoto && (
              <>
                <img src={largePhoto} alt="Large View" style={{ width: '100%', height: 'auto' }} />
                <Button variant="secondary" className="mt-3" onClick={handleCloseLargePhoto}>
                  Close
                </Button>
              </>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
