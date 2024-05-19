import 'bootstrap/dist/css/bootstrap.min.css';
import { BsFillCalendar2CheckFill } from "react-icons/bs";
import { Row, Col, Container, ListGroup, Card , Modal, Button} from 'react-bootstrap';
import Search from "./components/Search"
import AddAppointment from './components/AddAppointment';
import AppointmentInfo from './components/AppointmentInfo';
import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase'; // Ensure auth is imported from firebase
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  let [appointmentList, setAppointmentList] = useState([]);
  let [query, setQuery] = useState("");
  let [sortBy, setSortBy] = useState("aptDate");
  let [orderBy, setOrderBy] = useState("asc");

  useEffect(() => {
    const fetchAppointments = async () => {
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const data = [];
      querySnapshot.forEach(doc => {
        const appointmentData = { id: doc.id.toString(), ...doc.data() }; // Convert id to string
        // Check if the status is not 'done'
        if (appointmentData.status !== "Done" && appointmentData.status !== "done" ) {
          data.push(appointmentData);
        }
      });
      setAppointmentList(data);
    };
    fetchAppointments();
    return () => {
      setAppointmentList([]); 
    };
  }, []); 

  const handleDeleteAppointment = async (id) => {
    const customDocId = "aptId" + id;
    const updateDocRef = doc(db, "appointments", customDocId);
    try {
      const confirmDelete = window.confirm("Are you sure you want to mark this appointment as 'Done'?");
      if (confirmDelete) {
        // Update appointment status to "Done"
        await updateDoc(updateDocRef, { status: "Done" });
        // Refresh appointment list
        const updatedAppointments = appointmentList.filter(appointment => appointment.id !== id);
        setAppointmentList(updatedAppointments);
        console.log("Appointment marked as 'Done' with ID:", customDocId);
      }
    } catch (error) {
      console.error("Error marking appointment as 'Done':", error);
    }
  };

  const filteredAppointments = appointmentList.length > 0 ? appointmentList.filter(
    item => {
      // Check if all necessary properties are defined before accessing them
      const fullName = item.fullName ? item.fullName.toLowerCase() : "";
      const status = item.status ? item.status.toLowerCase() : "";
      const paidVia = item.paidVia ? item.paidVia.toLowerCase(): "";
      const venue = item.venue ? item.venue.toLowerCase(): "";
      const aptDate = item.aptDate ? item.aptDate.toLowerCase() : "";
      const bookingDetails = item.bookingDetails ? item.bookingDetails.toLowerCase() : "";
  
      return (
        fullName.includes(query.toLocaleLowerCase()) ||
        status.includes(query.toLocaleLowerCase()) ||
        paidVia.includes(query.toLocaleLowerCase()) ||
        venue.includes(query.toLocaleLowerCase()) ||
        aptDate.includes(query.toLocaleLowerCase()) ||
        bookingDetails.includes(query.toLocaleLowerCase())
      );
    }
  ).filter(appointment => appointment.status !== 'done').sort((a, b) => {
    let order = orderBy === "asc" ? 1 : -1;
    // Check if sortBy property is defined before accessing it
    const sortByA = a[sortBy] ? a[sortBy].toLowerCase() : "";
    const sortByB = b[sortBy] ? b[sortBy].toLowerCase() : "";
    return sortByA < sortByB ? -1 * order : 1 * order;
  }) : [];
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Define setSelectedAppointment
  const [showModal, setShowModal] = useState(false);
  
  const handleUpdateAppointment = (appointment) => {
    console.log(appointment)
    setSelectedAppointment(appointment);
    setShowModal(true); // Show the modal
  };
  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  const handleSaveChanges = async () => {
    try {
      const customDocId = "aptId" + selectedAppointment.id;
      const updateDocRef = doc(db, "appointments", customDocId);
      const updatedAppointmentData = { ...selectedAppointment, status: "Updated" }; // Modify the status or any other fields as needed
      await updateDoc(updateDocRef, updatedAppointmentData);
      const updatedAppointments = appointmentList.map(appointment => {
        if (appointment.id === selectedAppointment.id) {
          return { ...appointment, ...updatedAppointmentData };
        }
        return appointment;
      });
      setAppointmentList(updatedAppointments);
      setShowModal(false); // Close the modal after successful update
      console.log("Appointment updated successfully:", customDocId);
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  useEffect(() => {
    // Sign out user when the window or page is closed
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      signOut(auth).then(() => {
        console.log('User signed out.');
      }).catch((error) => {
        console.error('Error signing out:', error);
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
            <h1 className='text-center fw-light mt-3'><BsFillCalendar2CheckFill/> Appointments</h1>
           
          </Col>
          
        </Row>
        <Row className='justify-content-center'>
          <AddAppointment 
            onSendAppointment={myAppointment => setAppointmentList([...appointmentList, myAppointment])}
            lastId={appointmentList.reduce((max, item) => Number(item.id) > max ? Number(item.id) : max, 0)}
             />
            
        </Row>
        <Row className='justify-content-center'>
          <Col md="8">
            <Search 
              query={query}
              onQueryChange={myQuery => setQuery(myQuery)}
              orderBy={orderBy}
              onOrderByChange={mySort => setOrderBy(mySort)}
              sortBy={sortBy}
              onSortByChange={mySort => setSortBy(mySort)}
            />
          </Col >
         
        </Row>
        <Row className='justify-content-center'> 
          <Col md="8">
            <Card className="mb-3">
              <Card.Header>Appointments</Card.Header>
              <ListGroup variant='flush'>
                {filteredAppointments.map(appointment => (
                  <AppointmentInfo key={appointment.id} appointment={appointment}
                    onDeleteAppointment={handleDeleteAppointment}
                    onUpdateAppointment={handleUpdateAppointment}
                    />
                ))}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
       {/* Modal for updating appointment */}
       <Modal show={showModal} onHide={handleCloseModal}>
    <Modal.Header closeButton>
    <Modal.Title>Update Appointment</Modal.Title>
      </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <form>
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="fullName" 
                  value={selectedAppointment.fullName || ''} 
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, fullName: e.target.value})} 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="status" 
                  value={selectedAppointment.status || ''} 
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, status: e.target.value})} 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="paidVia" className="form-label">Paid Via</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="paidVia" 
                  value={selectedAppointment.paidVia || ''} 
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, paidVia: e.target.value})} 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="venue" className="form-label">Venue</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="venue" 
                  value={selectedAppointment.venue || ''} 
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, venue: e.target.value})} 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="aptDate" className="form-label">Appointment Date</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="aptDate" 
                  value={selectedAppointment.aptDate || ''} 
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, aptDate: e.target.value})} 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="bookingDetails" className="form-label">Booking Details</label>
                <textarea 
                  className="form-control" 
                  id="bookingDetails" 
                  rows="3" 
                  value={selectedAppointment.bookingDetails || ''} 
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, bookingDetails: e.target.value})} 
                ></textarea>
              </div>
            </form>
          )}
    </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
        </Modal.Footer>
    </Modal>

    </div>
  );
}

export default App;
