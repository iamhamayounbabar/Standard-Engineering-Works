/* eslint-disable no-undef */
import React from "react";
import Table from "./Table";
import 'firebase/firestore';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import moment from 'moment';


export default class History extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemName: "",
            companyName: '',
            qty: '',
            componentName: 'History',
            historyData: [],

        }
    }

    componentDidMount() {
        this.getHistoryData()
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const formattedDate = moment(date).format('DD-MM-YYYY hh:mm A');
        return formattedDate;
    }

    getHistoryData = async () => {
        let data = [];
        const db = getFirestore();
        const collectionRef = collection(db, 'History');
        try {
            const querySnapshot = await getDocs(collectionRef);
            querySnapshot._snapshot.docChanges.forEach((e) => {
                const companyName = e.doc.data.value.mapValue.fields.companyName.stringValue;
                const itemName = e.doc.data.value.mapValue.fields.itemName.stringValue;
                const qty = e.doc.data.value.mapValue.fields.qty.stringValue || e.doc.data.value.mapValue.fields.qty.integerValue;
                const timestamp = e.doc.data.value.mapValue.fields.created.timestampValue;
                const username = e.doc.data.value.mapValue.fields.username.stringValue;
                const created = this.formatTimestamp(timestamp);

                data.push({
                    companyName,
                    itemName,
                    qty,
                    created,
                    username,
                });
            });
            this.setState({ historyData: data });
        } catch (error) {
            console.error('Error getting data from Firestore:', error);
        }
    };

    render() {
        return (
            <>
                <button type="button" onClick={this.getHistoryData} className="btn btn-info" data-bs-toggle="modal" data-bs-target="#Inventory2">
                    History
                </button>
                <div className="modal fade" id="Inventory2" tabIndex="-1" aria-labelledby="InventoryLabel" aria-hidden="true">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="InventoryLabel">History</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <Table componentName={this.state.componentName}
                                    data={this.state.historyData}></Table>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}