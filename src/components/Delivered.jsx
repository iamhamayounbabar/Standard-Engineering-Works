/* eslint-disable no-undef */
import Table from "./Table";
import React from "react";
import 'firebase/firestore';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import moment from 'moment';

export default class Delivered extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemName: "",
            companyName: '',
            qty: '',
            componentName: 'Deliverd',
            deliveredData: [],
        }
    }

    componentDidMount() {
        this.getDeliveredData()
    }

    getDeliveredData = async () => {
        let data = [];
        const db = getFirestore();
        const collectionRef = collection(db, 'Delivered');
        try {
            const querySnapshot = await getDocs(collectionRef);
            querySnapshot._snapshot.docChanges.forEach((e) => {
                const itemName = e.doc.data.value.mapValue.fields.itemName.stringValue;
                const companyName = e.doc.data.value.mapValue.fields.companyName.stringValue;
                const qty = e.doc.data.value.mapValue.fields.qty.stringValue || e.doc.data.value.mapValue.fields.qty.integerValue;
                // const userId = e.doc.data.value.mapValue.fields.userid.stringValue;
                const username = e.doc.data.value.mapValue.fields.username.stringValue;
                const deliveredTo = e.doc.data.value.mapValue.fields.deliveredTo.stringValue
                const timestamp = e.doc.data.value.mapValue.fields.created.timestampValue;
                const created = this.formatTimestamp(timestamp);

                // const id = e.doc.key.path.segments[6]; 
                data.push({
                    companyName,
                    itemName,
                    qty,
                    created,
                    deliveredTo,
                    username
                });
            });
            this.setState({ deliveredData: data });
        } catch (error) {
            console.error('Error getting data from Firestore:', error);
        }
    };

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const formattedDate = moment(date).format('DD-MM-YYYY hh:mm A');
        return formattedDate;
    }

    render(){
        return (
            <>
                <button type="button" onClick={this.getDeliveredData} className="btn btn-success" data-bs-toggle="modal" data-bs-target="#Inventory3">
                    Delivered
                </button>
                <div className="modal fade" id="Inventory3" tabIndex="-1" aria-labelledby="InventoryLabel" aria-hidden="true">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="InventoryLabel">Deliverd</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <Table componentName={this.state.companyName}
                                data={this.state.deliveredData}></Table>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}