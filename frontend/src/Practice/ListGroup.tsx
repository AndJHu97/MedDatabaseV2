import { Fragment, useState } from 'react';
interface Props{
    items: string[];
    heading: String;
    onSelectItem: (item: string) => void;
}


function ListGroup({items, heading, onSelectItem}: Props) {
   

    const [selectedIndex, setSelectedIndex] = useState(-1);


    return (
    <Fragment>
        <h1>{heading}</h1>
        <ul className="list-group">
            {items.length === 0 && <p>No item found</p>}
            {items.map((item,index) => <li className = {selectedIndex === index ? "list-group-item active" : "list-group-item"} 
            key = {item} onClick = {() => {setSelectedIndex(index); onSelectItem(item);}}>{item}</li>)}
        </ul>
    </Fragment>
    );
}

export default ListGroup;