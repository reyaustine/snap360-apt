// import { Button, Card, Col, Form, Row } from "react-bootstrap";
// import { useState } from "react";

// function AddAppointment({lastId, onSendAppointment}) {

//     const clearData = {
//         firstName: '',
//         lastName: '',
//         aptDate: '',
//         aptTime: '',
//         bookingDetails: ''
//     }

//     let [toggleForm, setToggleForm] = useState(false);
//     let [formData, setFormData] = useState(clearData);

//     function formDataPublish() {
//         const appointmentInfo = {
//             id: lastId + 1,
//             firstName: formData.firstName,
//             lastName: formData.lastName,
//             aptDate: formData.aptDate + ' '  + formData.aptTime,
//             bookingDetails: formData.bookingDetails
//         }
//         onSendAppointment(appointmentInfo);
//         setFormData(clearData);
//         setToggleForm(!toggleForm);
//     }

//     return(
//         <>
//             <Col md="8">
//                 <Card className="mb-3">
//                 <Card.Header>
//                     Add Appointment
//                     <Button size="sm" 
//                             className="small float-end" 
//                             onClick={() => {setToggleForm(!toggleForm)}}>
//                     + </Button>
//                 </Card.Header>
//                 { toggleForm && 
//                     <Card.Body>
//                     <Form>
//                         <Row className="mb-3">
//                             <Form.Group as={Col}>
//                                 <Form.Label>First Name</Form.Label>
//                                 <Form.Control type="text" placeholder="First Name" id="firstName"
//                                 onChange={(event) => setFormData({...formData, firstName: event.target.value})}
//                                 />
//                             </Form.Group>
//                             <Form.Group as={Col}>
//                                 <Form.Label>Last Name</Form.Label>
//                                 <Form.Control type="text" placeholder="Last Name" id="lastName"
//                                 onChange={(event) => setFormData({...formData, lastName: event.target.value})}
//                                 />
//                             </Form.Group>
//                         </Row>
//                             <Form.Group as={Col} className="mb-3">
//                                 <Form.Label>Appointment Date</Form.Label>
//                                 <Form.Control type="date" id="aptDate"
//                                 onChange={(event) => setFormData({...formData, aptDate: event.target.value})}
//                                 />
//                             </Form.Group>
//                             <Form.Group as={Col} className="mb-3">
//                                 <Form.Label>Appointment Time</Form.Label>
//                                 <Form.Control type="time"  id="aptTime"
//                                 onChange={(event) => setFormData({...formData, aptTime: event.target.value})}
//                                 />
//                             </Form.Group>
//                             <Form.Group as={Col} className="mb-3">
//                                 <Form.Label>Booking Details</Form.Label>
//                                 <Form.Control as="textarea" placeholder="Booking Details"  id="bookingDetails"
//                                 onChange={(event) => setFormData({...formData, bookingDetails: event.target.value})}
//                                 />
//                             </Form.Group>
//                            <Button variant="primary" onClick={formDataPublish}>Submit</Button>
//                     </Form>
//                 </Card.Body>
//                 }
//                 </Card>
//             </Col>
//         </>
//     )
// }

// export default AddAppointment

import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useState } from "react";
import { addDoc , doc, setDoc, collection } from 'firebase/firestore';
import { db,storage } from '../firebase'; // Adjust the path to your firebase configuration file
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function AddAppointment({ lastId, onSendAppointment , selectedAppointment }) {

    //const [selectedFormData, setSelectedFormData] = useState({
        const [formData, setFormData] = useState({
        // Initialize formData state with default values or empty strings
        fullName: selectedAppointment ? selectedAppointment.fullName : "",
        contactNo: selectedAppointment ? selectedAppointment.contactNo : "",
        status: selectedAppointment ? selectedAppointment.status : "",
        paidVia: selectedAppointment ? selectedAppointment.paidVia : "",
        proofPhoto: selectedAppointment ? selectedAppointment.proofPhoto : "",
        rate: selectedAppointment ? selectedAppointment.rate : "",
        dpAmount: selectedAppointment ? selectedAppointment.dpAmount : "",
        venue: selectedAppointment ? selectedAppointment.venue : "",
        status: selectedAppointment ? selectedAppointment.status : "",
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
        rate: '',
        dpAmount: '',
        venue: '',
        aptDate: '',
        aptTime: '',
        bookingDetails: '',
        
    }

    let [toggleForm, setToggleForm] = useState(false);
    //let [formData, setFormData] = useState(clearData);

    async function formDataPublish() {
        // const storageRef = ref(storage, 'images/' + formData.proofPhoto);
        // try {
        //     await uploadBytes(storageRef, formData.proofPhoto);
        //     console.log("File uploaded successfully!");
        // } catch (error) {
        //     console.error("Error uploading file: ", error);
        //     return;
        // }
        // const downloadURL = await getDownloadURL(storageRef);
        const appointmentInfo = {
            id: lastId + 1,
            fullName: formData.fullName,
            contactNo: formData.contactNo,
            status: formData.status,
            paidVia: formData.paidVia,
            proofPhoto: 'downloadURL',
            dpAmount: formData.dpAmount,
            rate: formData.rate,
            venue: formData.venue,
            aptDate: formData.aptDate + ' ' + formData.aptTime,
            bookingDetails: formData.bookingDetails
        }
        // Save data to Firestore
        // try {
        //     const docRef = await addDoc(collection(db, 'appointments'), appointmentInfo);
        //     // Call onSendAppointment only after data is successfully saved to Firestore
        //     onSendAppointment(appointmentInfo);
        //     setFormData(clearData);
        //     setToggleForm(!toggleForm);
        //     console.log("Document written with ID: ", docRef.id);
        // } catch (e) {
        //     console.error("Error adding document: ", e);
        // }

        try {
            const customDocId = "aptId" + appointmentInfo.id; // Replace "yourCustomId" with your desired custom ID
            const customDocRef = doc(collection(db, 'appointments'), customDocId);
            
            // Set the document data using the custom document reference
            await setDoc(customDocRef, appointmentInfo);
        
            // Call onSendAppointment only after data is successfully saved to Firestore
            onSendAppointment(appointmentInfo);
            setFormData(clearData);
            setToggleForm(!toggleForm);
            console.log("Document written with ID: ", customDocId);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    return (
        <>
            <Col md="8">
                <Card className="mb-3">
                    <Card.Header>
                        Add Appointment
                        <Button size="sm"
                            className="small float-end"
                            onClick={() => { setToggleForm(!toggleForm) }}>
                            +
                        </Button>
                    </Card.Header>
                    {toggleForm &&
                        <Card.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Form.Group as={Col}>
                                        <Form.Label>FB Name</Form.Label>
                                        <Form.Control type="text" placeholder="Full Name or FB Name" id="fullName"
                                            onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Label>Contact No.</Form.Label>
                                        <Form.Control type="tel" placeholder="Mobile Number" id="contactNo"
                                            onChange={(event) => setFormData({ ...formData, contactNo: event.target.value })}
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                    <Form.Label>Booking Status</Form.Label>
                                    <Form.Control as="select" id="status"
                                        value={formData.status} // Set the selected value
                                        onChange={(event) => setFormData({ ...formData, status: event.target.value })}>
                                        <option value=" "> </option>
                                        <option value="Pending Payment">Pending Payment</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Done">Done</option>
                                        <option value="Canceled">Canceled</option>
                                    </Form.Control>
                                    </Form.Group>

                                    
                                </Row>

                                <Row>
                                <Form.Group as={Col}>
                                    <Form.Label>Paid Via</Form.Label>
                                    <Form.Control as="select" id="paidVia"
                                        value={formData.paidVia} // Set the selected value
                                        onChange={(event) => setFormData({ ...formData, paidVia: event.target.value })}>
                                        <option value=" "> </option>
                                        <option value="Gcash">Gcash</option>
                                        <option value="Cash">Cash</option>
                                        <option value="BPI">BPI</option>
                                        <option value="Seabank">Seabank</option>
                                    </Form.Control>
                                    </Form.Group>

                                <Form.Group as={Col}>
                                    <Form.Label>Package Rates</Form.Label>
                                    <Form.Control as="select" id="rate"
                                        value={formData.rate} // Set the selected value
                                        onChange={(event) => setFormData({ ...formData, rate: event.target.value })}
                                    >
                                        <option value="0">Choose a Package</option>
                                        <option value="7500">360 Videobooth 3hrs 7,499</option>
                                        <option value="3500">Photobooth 3hrs 3,500</option>
                                        <option value="10500">ALL IN 360 Videobooth and Photobooth 3hrs 10,500</option>
                                    </Form.Control>
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Label>Downpayment Amount</Form.Label>
                                        <Form.Control type="number" placeholder="DP Amount" id="dpAmount"
                                            onChange={(event) => setFormData({ ...formData, dpAmount: event.target.value })}
                                        />
                                    </Form.Group>

                                </Row>
                                
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Upload Screenshot of Payment or Reference No. Photo</Form.Label>
                                    <Form.Control type="file" id="proofPhoto"
                                        onChange={(event) => setFormData({ ...formData, proofPhoto: event.target.files[0] })}
                                    />

                                </Form.Group>
                                
                                <Row>
                                <Form.Group as={Col}>
                                        <Form.Label>Venue</Form.Label>
                                        <Form.Control type="text" placeholder="Venue" id="venue"
                                            onChange={(event) => setFormData({ ...formData, venue: event.target.value })}
                                        />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Appointment Date</Form.Label>
                                    <Form.Control type="date" id="aptDate"
                                        onChange={(event) => setFormData({ ...formData, aptDate: event.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Appointment Time</Form.Label>
                                    <Form.Control type="time" id="aptTime"
                                        onChange={(event) => setFormData({ ...formData, aptTime: event.target.value })}
                                    />
                                </Form.Group>
                                </Row>

                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Other Details</Form.Label>
                                    <Form.Control as="textarea" placeholder="Other Details here" id="bookingDetails"
                                        onChange={(event) => setFormData({ ...formData, bookingDetails: event.target.value })}
                                    />
                                </Form.Group>
                                <Button variant="primary" onClick={formDataPublish}>Submit</Button>
                            </Form>
                        </Card.Body>
                    }
                </Card>
            </Col>
        </>
    )
}

export default AddAppointment;
