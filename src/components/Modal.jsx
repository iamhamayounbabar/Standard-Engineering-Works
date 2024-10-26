/* eslint-disable no-undef */
import React from "react";
import 'firebase/firestore';
import { getFirestore, collection, addDoc, doc, updateDoc, } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import Delivered from "./Delivered";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import History from "./History";
import PropTypes from 'prop-types';
import moment from 'moment';
export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemName: "",
            companyName: '',
            qty: '',
            isLoading: false,
        }
    }

    extractValue(email) {
        const parts = email.split('@');
        if (parts.length >= 2) {
            const subparts = parts[0].split('.');
            if (subparts.length >= 2) {
                return subparts[0];
            } else {
                return parts[0];
            }
        } else {
            return email;
        }
    }

    isButtonEnabled = () => {
        const { itemName, companyName, qty } = this.state;
        return itemName && companyName && qty;
    }

    handleSubmit = async () => {
        this.setState({ isLoading: true });
        const { itemName, companyName, qty } = this.state;


        const user = getAuth().currentUser;

        if (user) {
            const userid = user.uid;
            const username = this.extractValue(user.email);
            const created = new Date()
            const db = getFirestore();

            let obj = {
                itemName,
                companyName,
                qty,
                userid,
                username,
                created,
                updated: null,
            }

            let exist = this.props.check(itemName, companyName)
            if (exist) {
                exist = exist[0]
                let quantity = parseInt(exist.qty) + parseInt(qty)

                const inventoryRef = doc(db, 'Inventory', exist.id);
                const updatedData = { qty: quantity };

                try {
                    await updateDoc(inventoryRef, updatedData);
                } catch (error) {
                    toast.success("Can't update")
                }
            }

            try {
                let inventoryRes;

                const historyCollectionRef = collection(db, 'History');
                await addDoc(historyCollectionRef, obj);
                if (!exist) {
                    const inventoryCollectionRef = collection(db, 'Inventory');
                    inventoryRes = await addDoc(inventoryCollectionRef, obj);
                    obj.id = inventoryRes.id;
                    obj.created = this.formatTimestamp(created);
                    this.props.addRow(obj);
                }

                this.setState({ itemName: '', companyName: '', qty: '' });

                toast.success("Data Successfully Added ");
            } catch (error) {
                toast.error("Error In Data Added");
            } finally {
                this.setState({ isLoading: false });
            }
        }
    };

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const formattedDate = moment(date).format('DD-MM-YYYY hh:mm A');
        return formattedDate;
    }

    render() {
        return (
            <>
                <div className="row">
                    <div className="col-12 d-flex justify-content-between align-items-center">
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#Inventory1">
                            Add +
                        </button>
                        <div className="d-flex gap-3">
                            <History />
                            <Delivered />
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="Inventory1" tabIndex="-1" aria-labelledby="InventoryLabel" aria-hidden="true">
                    <div className="modal-dialog modal-md">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="InventoryLabel">Add Inventory Record</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12 mx-auto">
                                        <div className="form-group">
                                            <label className="control-label">Items Name</label>
                                            <input
                                                type="text"
                                                name="itemName"
                                                className="form-control populate mt-2"
                                                value={this.state.itemName}
                                                onInput={(e) => this.setState({ itemName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label className="control-label">Company Name</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                className="form-control populate mt-2"
                                                value={this.state.companyName}
                                                onInput={(e) => this.setState({ companyName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label className="control-label">Quantity</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                className="form-control populate mt-2"
                                                value={this.state.qty}
                                                onInput={(e) => this.setState({ qty: e.target.value })}
                                            />
                                        </div>
                                        <button className="btn btn-success mt-3 w-100 p-2" onClick={this.handleSubmit} disabled={!this.isButtonEnabled() || this.state.isLoading}>
                                            {this.state.isLoading ? (
                                                <div className="spinner-grow spinner-grow-sm" role="status">
                                                </div>
                                            ) : (
                                                "Save"
                                            )}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

}

Modal.propTypes = {
    addRow: PropTypes.func,
    check: PropTypes.func,
    admin: PropTypes.bool
};