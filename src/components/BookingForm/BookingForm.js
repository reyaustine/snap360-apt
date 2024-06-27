import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Row, Card } from 'react-bootstrap';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment';
import './BookingForm.css';

const BookingForm = ({ selectedDate }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientNumber: '',
    eventDate: selectedDate || '',
    eventTime: '',
    service: '',
    bookingStatus: 'Confirmed',
    paymentStatus: 'Downpayment Paid',
    paidAmount: '',
    rate: '', // Added rate field
    paidVia: 'Gcash',
    paymentProof: null,
    venue: '',
    otherDetails: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setFormData((prevData) => ({
        ...prevData,
        eventDate: selectedDate,
      }));
    }
  }, [selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, paymentProof: e.target.files[0] });
  };

  const handleBookingStatusChange = (e) => {
    const bookingStatus = e.target.value;
    const paymentStatus = bookingStatus === 'Tentative' ? 'Tentative' : formData.paymentStatus;
    setFormData({ ...formData, bookingStatus, paymentStatus });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Retrieve all appointments to find the last id
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const lastDoc = querySnapshot.docs.sort((a, b) => {
        const aId = parseInt(a.id.replace('aptId', ''));
        const bId = parseInt(b.id.replace('aptId', ''));
        return aId - bId;
      }).pop();
      const lastId = lastDoc ? parseInt(lastDoc.id.replace('aptId', '')) : 0;
      const newId = `aptId${lastId + 1}`;

      let proofURL = '';
      if (formData.paymentProof) {
        const proofRef = ref(storage, `paymentProofs/${newId}`);
        await uploadBytes(proofRef, formData.paymentProof);
        proofURL = await getDownloadURL(proofRef);
      }

      await setDoc(doc(db, 'appointments', newId), {
        ...formData,
        aptDate: moment(`${formData.eventDate} ${formData.eventTime}`).toDate(),
        paymentProof: proofURL,
        savedBy: auth.currentUser.email,
        savedDate: serverTimestamp(),
        updateDate: null,
      });

      setFormData({
        clientName: '',
        clientNumber: '',
        eventDate: '',
        eventTime: '',
        service: '',
        bookingStatus: 'Confirmed',
        paymentStatus: 'Downpayment Paid',
        paidAmount: '',
        rate: '', // Reset rate field
        paidVia: 'Gcash',
        paymentProof: null,
        venue: '',
        otherDetails: '',
      });

      alert('Appointment saved successfully!');
    } catch (error) {
      console.error('Error saving appointment: ', error);
      alert('Failed to save appointment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <h5>New Booking</h5>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formClientName">
              <Form.Label>Client Name</Form.Label>
              <Form.Control
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formClientNumber">
              <Form.Label>Client Number</Form.Label>
              <Form.Control
                type="text"
                name="clientNumber"
                value={formData.clientNumber}
                onChange={handleInputChange}
                required
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
                required
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formEventTime">
              <Form.Label>Event Time</Form.Label>
              <Form.Control
                type="time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleInputChange}
                required
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
                required
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
                onChange={handleBookingStatusChange}
                required
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
                required
              >
                <option value="Downpayment Paid">Downpayment Paid</option>
                <option value="Full Paid">Full Paid</option>
                <option value="Tentative">Tentative</option> {/* Added this option */}
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
                required
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formRate">
              <Form.Label>Rate</Form.Label>
              <Form.Control
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formPaidVia">
              <Form.Label>Paid Via</Form.Label>
              <Form.Control
                as="select"
                name="paidVia"
                value={formData.paidVia}
                onChange={handleInputChange}
                required
              >
                <option>Gcash</option>
                <option>Seabank</option>
                <option>Cash</option>
                <option>Paypal</option>
                <option>Bank Transfer</option>
              </Form.Control>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formPaymentProof">
              <Form.Label>Payment Proof</Form.Label>
              <Form.Control
                type="file"
                name="paymentProof"
                onChange={handleFileChange}
              />
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
                required
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
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Booking'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BookingForm;
