import { FormControl, InputGroup, DropdownButton , Dropdown} from "react-bootstrap";
import { BsCheck2 } from "react-icons/bs";

const DropDown = ({sortBy, onSortByChange, orderBy, onOrderByChange}) => {
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