import { FormControl, InputGroup, DropdownButton , Dropdown , Button} from "react-bootstrap";
import { BsCheck2 } from "react-icons/bs";
import { useState } from "react";
import { signOut } from "firebase/auth"; // Import signOut function from Firebase Authentication
import { auth } from "../firebase"; // Import auth

const DropDown = ({sortBy, onSortByChange, orderBy, onOrderByChange}) => {
    const handleLogout = () => {
        signOut(auth) // Sign out the user
          .then(() => {
            // Handle successful logout, e.g., redirect to login page
          })
          .catch((error) => {
            // Handle logout error
            console.error("Error logging out:", error);
          });
      };

    return(
        <>
            <DropdownButton
                variant="info"
                title="Sort"
                >
                <Dropdown.Item href="#" onClick={() => onSortByChange('aptDate')}>Booking Date {(sortBy == 'aptDate') && <BsCheck2 className="float-end" />}</Dropdown.Item>
                <Dropdown.Item href="#" onClick={() => onSortByChange('status')}>Booking Status{(sortBy == 'status') && <BsCheck2 className="float-end" />}</Dropdown.Item>
                <Dropdown.Item href="#" onClick={() => onSortByChange('fullName')}>FB Name{(sortBy == 'fullName') && <BsCheck2 className="float-end" />}</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#" onClick={() => onOrderByChange('asc')}>ASC {(orderBy == 'asc') && <BsCheck2 className="float-end" />}</Dropdown.Item>
                <Dropdown.Item href="#" onClick={() => onOrderByChange('desc')}>DESC {(orderBy == 'desc') && <BsCheck2 className="float-end" />}</Dropdown.Item>
            </DropdownButton>
            <Button size="sm" variant="danger" className="small float-end" onClick={handleLogout}>
                Logout
            </Button>
        </>
    ) 
}

const Search = ({query, onQueryChange, sortBy, onSortByChange, orderBy, onOrderByChange}) => {
    return(
        <>
        <InputGroup className="mb-3 mt-2">
            <FormControl placeholder="Search" onChange={(event) => {
                onQueryChange(event.target.value)
            }} value={query}/>
            <DropDown
             sortBy={sortBy}
             onSortByChange={mySort => onSortByChange(mySort)}
             orderBy={orderBy}
             onOrderByChange={myOrder => onOrderByChange(myOrder)} 
             />
        </InputGroup>
        </>
    )
}

export default Search