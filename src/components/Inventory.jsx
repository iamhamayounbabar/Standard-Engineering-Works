/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import Table from "./Table";
import Modal from "./Modal";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';


export default function Inventory(props) {

  const componentName = "inventory";
  const [dataFromFirestore, setdataFromFirestore] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDataFromFirestore();
  }, []);

  function addRow(data) {
    setdataFromFirestore(prevData => [...prevData, data]);
  }


  async function getDataFromFirestore() {
    setLoading(true);
    let data = [];
    const db = getFirestore();
    const collectionRef = collection(db, 'Inventory');
    try {
      const querySnapshot = await getDocs(collectionRef);
      querySnapshot._snapshot.docChanges.forEach((e) => {
        const itemName = e.doc.data.value.mapValue.fields.itemName.stringValue;
        const companyName = e.doc.data.value.mapValue.fields.companyName.stringValue;
        const qty = e.doc.data.value.mapValue.fields.qty.integerValue || e.doc.data.value.mapValue.fields.qty.stringValue;
        const userId = e.doc.data.value.mapValue.fields.userid.stringValue;
        const username = e.doc.data.value.mapValue.fields.username.stringValue;
        const timestamp = e.doc.data.value.mapValue.fields.created.timestampValue;

        const created = formatTimestamp(timestamp);

        const id = e.doc.key.path.segments[6];
        data.push({
          companyName,
          itemName,
          qty,
          id,
          userId,
          created,
          username,
          editing: false,
          edited: false,
          editedCompanyName: companyName,
          editedItemName: itemName,
          editedQty: 0,
          outDeliveredTo: '',
          inQty: null,
          outQty: null,
          qtyEditable: false
        });
      });
      setdataFromFirestore(data);
    } catch (error) {
      console.error('Error getting data from Firestore:', error);
    }
    setLoading(false);
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const formattedDate = moment(date).format('DD-MM-YYYY hh:mm A');
    return formattedDate;
  }

  function check(itemName, companyName) {
    let res = dataFromFirestore.filter(f => f.itemName.toLowerCase() === itemName.toLowerCase() && f.companyName.toLowerCase() === companyName.toLowerCase())
    if (res.length > 0) {
      return res;
    }
    return null;
  }


  return (
    <>
      <div className="row ">
        <div className="col-12 mt-3">
          <Modal addRow={addRow} admin={props.admin} check={check} />
        </div>
      </div>
      <div className="row my-4">
        <div className="col-12 mx-auto">
          <Table componentName={componentName}
            data={dataFromFirestore} admin={props.admin} loading={loading} />
        </div>
      </div>
    </>
  )
}