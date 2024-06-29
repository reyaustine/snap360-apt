import { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path to your firebase configuration file
import './AddAppointment.css';

function AddAppointment({ lastId, onSendAppointment, selectedAppointment }) {
    const [formData, setFormData] = useState({
        fullName: selectedAppointment ? selectedAppointment.fullName : "",
        contactNo: selectedAppointment ? selectedAppointment.contactNo : "",
        status: selectedAppointment ? selectedAppointment.status : "",
        paidVia: selectedAppointment ? selectedAppointment.paidVia : "",
        proofPhoto: selectedAppointment ? selectedAppointment.proofPhoto : "",
        service: selectedAppointment ? selectedAppointment.service : "",
        rate: selectedAppointment ? selectedAppointment.rate : "",
        dpAmount: selectedAppointment ? selectedAppointment.dpAmount : "",
        extensionHours: selectedAppointment ? selectedAppointment.extensionHours : "",
        venue: selectedAppointment ? selectedAppointment.venue : "",
        transpoFee: selectedAppointment ? selectedAppointment.transpoFee : "",
        aptDate: selectedAppointment ? selectedAppointment.aptDate : "",
        aptTime: selectedAppointment ? selectedAppointment.aptTime : "",
        bookingDetails: selectedAppointment ? selectedAppointment.bookingDetails : ""
    });

    const clearData = {
        fullName: '',
        contactNo: '',
        status: '',
        paidVia: '',
        proofPhoto: null,
        service: '',
        rate: '',
        dpAmount: '',
        extensionHours: '',
        venue: '',
        transpoFee: '',
        aptDate: '',
        aptTime: '',
        bookingDetails: '',
    };

    let [toggleForm, setToggleForm] = useState(false);

    async function formDataPublish() {
        const appointmentInfo = {
            id: lastId + 1,
            fullName: formData.fullName,
            contactNo: formData.contactNo,
            status: formData.status,
            paidVia: formData.paidVia,
            proofPhoto: 'downloadURL',
            service: formData.service,
            rate: formData.rate,
            dpAmount: formData.dpAmount,
            extensionHours: formData.extensionHours,
            venue: formData.venue,
            transpoFee: formData.transpoFee,
            aptDate: formData.aptDate + ' ' + formData.aptTime,
            bookingDetails: formData.bookingDetails
        };
        try {
            const customDocId = "aptId" + appointmentInfo.id; // Replace "yourCustomId" with your desired custom ID
            const customDocRef = doc(collection(db, 'appointments'), customDocId);
            await setDoc(customDocRef, appointmentInfo);
            onSendAppointment(appointmentInfo);
            setFormData(clearData);
            setToggleForm(!toggleForm);
            console.log("Document written with ID: ", customDocId);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    return (
        <Col md="8">
            <Card className="mb-3 custom-card">
                <Card.Header className="d-flex justify-content-between align-items-center custom-card-header">
                    Add Appointment
                    <Button size="sm" onClick={() => setToggleForm(!toggleForm)}>+</Button>
                </Card.Header>
                {toggleForm && (
                    <Card.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Full Name or FB Name"
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Contact No.</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Mobile Number"
                                        id="contactNo"
                                        value={formData.contactNo}
                                        onChange={(event) => setFormData({ ...formData, contactNo: event.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Booking Status</Form.Label>
                                    <Form.Control
                                        as="select"
                                        id="status"
                                        value={formData.status}
                                        onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                                    >
                                        <option value=" "> </option>
                                        <option value="Pending Payment">Pending Payment</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Done">Done</option>
                                        <option value="Canceled">Canceled</option>
                                    </Form.Control>
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Paid Via</Form.Label>
                                    <Form.Control
                                        as="select"
                                        id="paidVia"
                                        value={formData.paidVia}
                                        onChange={(event) => setFormData({ ...formData, paidVia: event.target.value })}
                                    >
                                        <option value=" "> </option>
                                        <option value="Gcash">Gcash</option>
                                        <option value="Cash">Cash</option>
                                        <option value="BPI">BPI</option>
                                        <option value="Seabank">Seabank</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Service</Form.Label>
                                    <Form.Control
                                        as="select"
                                        id="service"
                                        value={formData.service}
                                        onChange={(event) => setFormData({ ...formData, service: event.target.value })}
                                    >
                                        <option value="0">Choose a Service</option>
                                        <option value="360 Videobooth">360 Videobooth</option>
                                        <option value="Photobooth">Photobooth</option>
                                        <option value="360 Videobooth and Photobooth">360 Videobooth and Photobooth</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Rate</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Rate"
                                        id="rate"
                                        value={formData.rate}
                                        onChange={(event) => setFormData({ ...formData, rate: event.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Downpayment Amount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="DP Amount"
                                        id="dpAmount"
                                        value={formData.dpAmount}
                                        onChange={(event) => setFormData({ ...formData, dpAmount: event.target.value })}
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Extension Hours</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Extension Hours"
                                        id="extensionHours"
                                        value={formData.extensionHours}
                                        onChange={(event) => setFormData({ ...formData, extensionHours: event.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Upload Screenshot of Payment or Reference No. Photo</Form.Label>
                                    <Form.Control
                                        type="file"
                                        id="proofPhoto"
                                        onChange={(event) => setFormData({ ...formData, proofPhoto: event.target.files[0] })}
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Venue</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Venue"
                                        id="venue"
                                        value={formData.venue}
                                        onChange={(event) => setFormData({ ...formData, venue: event.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Transpo Fee</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Transpo Fee"
                                        id="transpoFee"
                                        value={formData.transpoFee}
                                        onChange={(event) => setFormData({ ...formData, transpoFee: event.target.value })}
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Appointment Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        id="aptDate"
                                        value={formData.aptDate}
                                        onChange={(event) => setFormData({ ...formData, aptDate: event.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Appointment Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        id="aptTime"
                                        value={formData.aptTime}
                                        onChange={(event) => setFormData({ ...formData, aptTime: event.target.value })}
                                    />
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Other Details</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows="3"
                                    placeholder="Other Details here"
                                    id="bookingDetails"
                                    value={formData.bookingDetails}
                                    onChange={(event) => setFormData({ ...formData, bookingDetails: event.target.value })}
                                />
                            </Form.Group>
                            <Button variant="primary" className="custom-button" onClick={formDataPublish}>Submit</Button>
                        </Form>
                    </Card.Body>
                )}
            </Card>
        </Col>
    );
}

export default AddAppointment;
