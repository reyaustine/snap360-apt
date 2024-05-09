import { Button, ListGroup } from "react-bootstrap"
import Image from 'react-bootstrap/Image';
import { RiDeleteBin6Line } from "react-icons/ri";

function AppointmentInfo({appointment, onDeleteAppointment}) {

   
 
    return(
        <>
            <ListGroup.Item>
                <h4><strong>Date: {appointment.aptDate} {appointment.venue}</strong></h4>
                <p><strong>Full Name or FB Name: {appointment.fullName} </strong></p>
                <p><strong>Contact No.: {appointment.contactNo}</strong></p>
                <p><strong>Booking Status: {appointment.status}</strong></p>
                <p><strong>Paid Via: {appointment.paidVia}</strong></p>
                <p><strong>Rate: {appointment.rate}</strong></p>
                <p><strong>DP Amount: {appointment.dpAmount}</strong></p>
                {appointment.photoProof && <Image src={appointment.photoProof} rounded />}
                <p><strong>Proof of Payment: {appointment.photoProof}</strong></p>
                <p><strong>Details: {appointment.bookingDetails}</strong></p>
                <Button onClick={() => {onDeleteAppointment(appointment.id)}} size="sm" variant="danger"><RiDeleteBin6Line /> Delete</Button>
            </ListGroup.Item>
        </>
    )
}

export default AppointmentInfo