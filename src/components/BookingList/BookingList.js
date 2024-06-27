import React, { useState, useEffect } from 'react';
import { Card, Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase'; // Adjust the path to your firebase configuration file
import moment from 'moment';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactImageMagnify from 'react-image-magnify';

const BookingList = () => {
  const [bookingsByMonth, setBookingsByMonth] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientNumber: '',
    eventDate: '',
    eventTime: '',
    service: '',
    bookingStatus: '',
    paymentStatus: '',
    paidAmount: '',
    paidVia: '',
    paymentProof: [],
    venue: '',
    otherDetails: '',
  });

  const fetchBookings = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const data = {};

    querySnapshot.forEach(doc => {
      const bookingData = doc.data();
      const aptDate = bookingData.aptDate.toDate ? bookingData.aptDate.toDate() : new Date(bookingData.aptDate);
      const month = moment(aptDate).format('MMMM YYYY');

      if (!data[month]) {
        data[month] = [];
      }

      data[month].push({
        id: doc.id,
        title: bookingData.clientName || bookingData.fullName || 'No Name',
        eventDate: moment(aptDate).format('YYYY-MM-DD'),
        eventTime: bookingData.eventTime || '',
        status: bookingData.status || bookingData.bookingStatus || '',
      });
    });

    setBookingsByMonth(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEventClick = async (booking) => {
    const docRef = doc(db, 'appointments', booking.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const bookingData = docSnap.data();
      setFormData({
        clientName: bookingData.clientName || bookingData.fullName || '',
        clientNumber: bookingData.clientNumber || '',
        eventDate: bookingData.eventDate ? moment(bookingData.eventDate).format('YYYY-MM-DD') : moment(bookingData.aptDate.toDate ? bookingData.aptDate.toDate() : bookingData.aptDate).format('YYYY-MM-DD'),
        eventTime: bookingData.eventTime || '',
        service: bookingData.service || '',
        bookingStatus: bookingData.bookingStatus || bookingData.status || '',
        paymentStatus: bookingData.paymentStatus || '',
        paidAmount: bookingData.paidAmount || bookingData.dpAmount || '',
        paidVia: bookingData.paidVia || '',
        paymentProof: Array.isArray(bookingData.paymentProof) ? bookingData.paymentProof : bookingData.paymentProof ? [bookingData.paymentProof] : [],
        venue: bookingData.venue || '',
        otherDetails: bookingData.otherDetails || bookingData.bookingDetails || '',
      });
      setSelectedBooking({ id: booking.id, savedBy: bookingData.savedBy });
      setShowModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, paymentProof: [...formData.paymentProof, e.target.files[0]] });
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    const bookingRef = doc(db, 'appointments', selectedBooking.id);
    const newProofs = [];

    for (let file of formData.paymentProof) {
      if (file instanceof File) {
        const proofRef = ref(storage, `paymentProofs/${selectedBooking.id}_${Date.now()}`);
        await uploadBytes(proofRef, file);
        const proofURL = await getDownloadURL(proofRef);
        newProofs.push(proofURL);
      } else {
        newProofs.push(file);
      }
    }

    await updateDoc(bookingRef, {
      ...formData,
      paymentProof: newProofs,
      updateDate: serverTimestamp(),
      updatedBy: auth.currentUser.email,
    });

    setShowModal(false);
    alert('Booking updated successfully!');
    fetchBookings(); // Refresh the booking list
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <div>
      {Object.keys(bookingsByMonth).map(month => (
        <Card className="mb-4" key={month}>
          <Card.Header>{month}</Card.Header>
          <Card.Body>
            {bookingsByMonth[month].map((booking, index) => (
              <div key={booking.id} className="mb-3">
                <h5 onClick={() => handleEventClick(booking)} style={{ cursor: 'pointer' }}>
                  {index + 1}. {booking.title}
                </h5>
                <p><strong>Event Date:</strong> {booking.eventDate}</p>
                <p><strong>Event Time:</strong> {booking.eventTime}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <hr />
              </div>
            ))}
          </Card.Body>
        </Card>
      ))}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formClientName">
                <Form.Label>Client Name</Form.Label>
                <Form.Control
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formClientNumber">
                <Form.Label>Client Number</Form.Label>
                <Form.Control
                  type="text"
                  name="clientNumber"
                  value={formData.clientNumber}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formEventDate">
                <Form.Label>Event Date</Form.Label>
                <Form.Control
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formEventTime">
                <Form.Label>Event Time</Form.Label>
                <Form.Control
                  type="time"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formService">
                <Form.Label>Service</Form.Label>
                <Form.Control
                  as="select"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                >
                  <option value="">Select a service</option>
                  <option value="360 Videobooth 3hrs">360 Videobooth 3hrs</option>
                  <option value="Photobooth 3hrs">Photobooth 3hrs</option>
                  <option value="360 VB & PB 3hrs">360 VB & PB 3hrs</option>
                  <option value="360 Videobooth 2hrs">360 Videobooth 2hrs</option>
                  <option value="Photobooth 2hrs">Photobooth 2hrs</option>
                  <option value="360 VB & PB 2hrs">360 VB & PB 2hrs</option>
                </Form.Control>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formBookingStatus">
                <Form.Label>Booking Status</Form.Label>
                <Form.Control
                  as="select"
                  name="bookingStatus"
                  value={formData.bookingStatus}
                  onChange={handleInputChange}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Tentative">Tentative</option>
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} controlId="formPaymentStatus">
                <Form.Label>Payment Status</Form.Label>
                <Form.Control
                  as="select"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                >
                  <option value="Downpayment Paid">Downpayment Paid</option>
                  <option value="Full Paid">Full Paid</option>
                  <option value="Tentative">Tentative</option>
                </Form.Control>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formPaidAmount">
                <Form.Label>Paid Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formPaidVia">
                <Form.Label>Paid Via</Form.Label>
                <Form.Control
                  as="select"
                  name="paidVia"
                  value={formData.paidVia}
                  onChange={handleInputChange}
                >
                  <option value="Gcash">Gcash</option>
                  <option value="Seabank">Seabank</option>
                  <option value="Cash">Cash</option>
                  <option value="Paypal">Paypal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </Form.Control>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formVenue">
                <Form.Label>Venue</Form.Label>
                <Form.Control
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Row>

            <Form.Group controlId="formOtherDetails" className="mb-3">
              <Form.Label>Other Details</Form.Label>
              <Form.Control
                as="textarea"
                name="otherDetails"
                value={formData.otherDetails}
                onChange={handleInputChange}
                rows={4}
              />
            </Form.Group>

            <Form.Group controlId="formPaymentProof" className="mb-3">
              <Form.Label>Payment Proof</Form.Label>
              <Form.Control
                type="file"
                name="paymentProof"
                onChange={handleFileChange}
              />
            </Form.Group>

            {selectedBooking && formData.paymentProof.length > 0 && (
              <div className="d-flex justify-content-between">
                {formData.paymentProof.map((proof, index) => (
                  <ReactImageMagnify
                    key={index}
                    {...{
                      smallImage: {
                        alt: 'Payment Proof',
                        isFluidWidth: true,
                        src: proof,
                        width: 100,
                        height: 100,
                      },
                      largeImage: {
                        src: proof,
                        width: 1200,
                        height: 1200,
                      },
                    }}
                    style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateBooking}>
            Update Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingList;
