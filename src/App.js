// import 'bootstrap/dist/css/bootstrap.min.css';
// import { BsFillCalendar2CheckFill } from "react-icons/bs";
// import { Row, Col, Container, ListGroup, Card } from 'react-bootstrap';
// import Search from "./components/Search"
// import AddAppointment from './components/AddAppointment';
// //import appointmentList from "./data.json";
// import AppointmentInfo from './components/AppointmentInfo';
// import { useCallback, useEffect, useState } from 'react';
// import { collection, addDoc, getDocs } from 'firebase/firestore';
// import { db } from './firebase';

// function App() {
//   let [appointmentList, setAppointmentList] = useState([]);
//   let [query, setQuery] = useState("");
//   let [sortBy, setSortBy] = useState("firstName");
//   let [orderBy, setOrderBy] = useState("asc");

//   const filteredAppointments = appointmentList.filter(
//     item  => {
//       return (
//         item.firstName.toLowerCase().includes(query.toLocaleLowerCase()) ||
//         item.lastName.toLowerCase().includes(query.toLocaleLowerCase()) ||
//         item.aptDate.toLowerCase().includes(query.toLocaleLowerCase()) ||
//         item.bookingDetails.toLowerCase().includes(query.toLocaleLowerCase())
//       )
//     }
//   ).sort((a,b) => {
//     let order = (orderBy === "asc") ? 1 : -1;
//     return(
//       a[sortBy].toLowerCase() < b[sortBy].toLowerCase() ? -1 * order : 1 * order
//     )
//   })


//   const fetchData = useCallback(() => {
//     fetch('./data.json')
//     .then(response => response.json())
//     .then(data => {
//       setAppointmentList(data)
//     })
//   }, [])
//   // useEffect(() => {
//   //   const fetchAppointments = async () => {
//   //     const querySnapshot = await getDocs(collection(db, 'appointments'));
//   //     const data = [];
//   //     querySnapshot.forEach(doc => {
//   //       data.push(doc.data());
//   //     });
//   //     setAppointmentList(data);
//   //   };
//   //   fetchAppointments();
//   // }, []);

// useEffect(() => {
//   fetchData()
// },[fetchData])

//   return (
//     <div className="App">
//       <Container>
//         <Row>
//         <Col>
//           <h1 className='text-center fw-light mt-3'><BsFillCalendar2CheckFill/> Appointments</h1>
//         </Col>
//         </Row>
//         <Row className='justify-content-center'>
//           <AddAppointment 
//           onSendAppointment={myAppointment => setAppointmentList([...appointmentList,myAppointment])}
//           lastId={appointmentList.reduce((max,item) => Number(item.id) > max ? Number(item.id) : max, 0)} />
//         </Row>
//         <Row className='justify-content-center'>
//           <Col md="4">
//           <Search 
//           query={query}
//           onQueryChange={myQuery => setQuery(myQuery)}
//           orderBy={orderBy}
//           onOrderByChange={mySort => setOrderBy(mySort)}
//           sortBy={sortBy}
//           onSortByChange={mySort => setSortBy(mySort)}
//           />
//           </Col>
//         </Row>
//        <Row className='justify-content-center'> 
//         <Col md="8">
//           <Card className="mb-3">
//             <Card.Header>Appointments</Card.Header>
//             <ListGroup variant='flush'>
//               {filteredAppointments.map(appointment => (
//                 <AppointmentInfo key={appointment.id} appointment={appointment}
//                 onDeleteAppointment={
//                   appointmentId => setAppointmentList(appointmentList.filter(
//                     appointment => appointment.id !== appointmentId
//                   ))

//                 } />
//               ))}
//             </ListGroup>
//           </Card>
//         </Col>
//        </Row>
//       </Container>
    
//     </div>
//   );
// }

// export default App;

// import 'bootstrap/dist/css/bootstrap.min.css';
// import { BsFillCalendar2CheckFill } from "react-icons/bs";
// import { Row, Col, Container, ListGroup, Card } from 'react-bootstrap';
// import Search from "./components/Search"
// import AddAppointment from './components/AddAppointment';
// import AppointmentInfo from './components/AppointmentInfo';
// import { useEffect, useState } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from './firebase';

// function App() {
//   let [appointmentList, setAppointmentList] = useState([]);
//   let [query, setQuery] = useState("");
//   let [sortBy, setSortBy] = useState("aptDate");
//   let [orderBy, setOrderBy] = useState("asc");

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       const querySnapshot = await getDocs(collection(db, 'appointments'));
//       const data = [];
//       querySnapshot.forEach(doc => {
//         data.push(doc.data());
//       });
//       setAppointmentList(data);
//     };
//     fetchAppointments();
//   }, []);

//   const filteredAppointments = appointmentList.length > 0 ? appointmentList.filter(
//     item => {
//       // Check if all necessary properties are defined before accessing them
//       const fullName = item.fullName ? item.fullName.toLowerCase() : "";
//       const status = item.status ? item.status.toLowerCase() : "";
//       const paidVia = item.paidVia ? item.paidVia.toLowerCase(): "";
//       const aptDate = item.aptDate ? item.aptDate.toLowerCase() : "";
//       const bookingDetails = item.bookingDetails ? item.bookingDetails.toLowerCase() : "";
  
//       return (
//         fullName.includes(query.toLocaleLowerCase()) ||
//         status.includes(query.toLocaleLowerCase()) ||
//         paidVia.includes(query.toLocaleLowerCase()) ||
//         aptDate.includes(query.toLocaleLowerCase()) ||
//         bookingDetails.includes(query.toLocaleLowerCase())
//       );
//     }
//   ).sort((a, b) => {
//     let order = orderBy === "asc" ? 1 : -1;
//     // Check if sortBy property is defined before accessing it
//     const sortByA = a[sortBy] ? a[sortBy].toLowerCase() : "";
//     const sortByB = b[sortBy] ? b[sortBy].toLowerCase() : "";
//     return sortByA < sortByB ? -1 * order : 1 * order;
//   }) : [];
  

//   return (
//     <div className="App">
//       <Container>
//         <Row>
//           <Col>
//             <h1 className='text-center fw-light mt-3'><BsFillCalendar2CheckFill/> Appointments</h1>
//           </Col>
//         </Row>
//         <Row className='justify-content-center'>
//           <AddAppointment 
//             onSendAppointment={myAppointment => setAppointmentList([...appointmentList, myAppointment])}
//             lastId={appointmentList.reduce((max, item) => Number(item.id) > max ? Number(item.id) : max, 0)} />
//         </Row>
//         <Row className='justify-content-center'>
//           <Col md="4">
//             <Search 
//               query={query}
//               onQueryChange={myQuery => setQuery(myQuery)}
//               orderBy={orderBy}
//               onOrderByChange={mySort => setOrderBy(mySort)}
//               sortBy={sortBy}
//               onSortByChange={mySort => setSortBy(mySort)}
//             />
//           </Col>
//         </Row>
//         <Row className='justify-content-center'> 
//           <Col md="8">
//             <Card className="mb-3">
//               <Card.Header>Appointments</Card.Header>
//               <ListGroup variant='flush'>
//                 {filteredAppointments.map(appointment => (
//                   <AppointmentInfo key={appointment.id} appointment={appointment}
//                     onDeleteAppointment={
//                       appointmentId => setAppointmentList(appointmentList.filter(
//                         appointment => appointment.id !== appointmentId
//                       ))
//                     } />
//                 ))}
//               </ListGroup>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   );
// }

// export default App;


import 'bootstrap/dist/css/bootstrap.min.css';
import { BsFillCalendar2CheckFill } from "react-icons/bs";
import { Row, Col, Container, ListGroup, Card } from 'react-bootstrap';
import Search from "./components/Search"
import AddAppointment from './components/AddAppointment';
import AppointmentInfo from './components/AppointmentInfo';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

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
  }, []);
  
  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const data = [];
    querySnapshot.forEach(doc => {
      const appointmentData = { id: doc.id.toString(), ...doc.data() }; // Convert id to string
      // Check if the status is not 'done'
      if (appointmentData.status !== "done") {
        data.push(appointmentData);
      }
    });
    setAppointmentList(data);
  };
  
  const handleDeleteAppointment = async (appointmentId) => {
    // Ensure appointmentId is a string
    if (typeof appointmentId !== 'string') {
      console.error("Invalid appointment ID:", appointmentId);
      return;
    }
  
    // Create a document reference using the appointmentId
    const appointmentRef = doc(db, 'appointments', appointmentId); 
  
    try {
      await updateDoc(appointmentRef, {
        status: 'done'
      });
      // Update state to remove the appointment
      setAppointmentList(appointmentList.filter(appointment => appointment.id !== appointmentId));
    } catch (error) {
      console.error("Error updating document: ", error);
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
            lastId={appointmentList.reduce((max, item) => Number(item.id) > max ? Number(item.id) : max, 0)} />
        </Row>
        <Row className='justify-content-center'>
          <Col md="4">
            <Search 
              query={query}
              onQueryChange={myQuery => setQuery(myQuery)}
              orderBy={orderBy}
              onOrderByChange={mySort => setOrderBy(mySort)}
              sortBy={sortBy}
              onSortByChange={mySort => setSortBy(mySort)}
            />
          </Col>
        </Row>
        <Row className='justify-content-center'> 
          <Col md="8">
            <Card className="mb-3">
              <Card.Header>Appointments</Card.Header>
              <ListGroup variant='flush'>
                {filteredAppointments.map(appointment => (
                  <AppointmentInfo key={appointment.id} appointment={appointment}
                    onDeleteAppointment={handleDeleteAppointment} />
                ))}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
