import React from "react";
import searchImg from '../assets/images/search-icon.png'
import tick from '../assets/images/tick.png'
import cross from '../assets/images/cross.png'
// import VisibilitySensor from 'react-visibility-sensor';
import PropTypes from 'prop-types';
import { getFirestore, updateDoc, doc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from "react-toastify";
import _ from 'lodash';


export default class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataFilter: [],
      searchTerm: '',
    };
  }

  componentDidUpdate(prevProp) {
    if (!_.isEqual(prevProp, this.props)) {
      this.setState({ data: this.props.data, dataFilter: this.props.data });
    }
  }

  onChange = (isVisible) => {
    console.log('Element is now %s', isVisible ? 'visible' : 'hidden');
  }

  addHistory = async (item, db, whatHistory, qty, deliveredTo) => {
    const user = getAuth().currentUser;
    const username = this.extractValue(user.email);
    if (user) {
      const historyRef = collection(db, whatHistory);
      const deliveredData = {
        itemName: item.itemName,
        companyName: item.companyName,
        username,
        qty: parseInt(qty),
        created: new Date(),
        deliveredTo: deliveredTo
      };
      await addDoc(historyRef, deliveredData);
      toast.success("Inventory updated successfully");
    }
  }

  handleButtonClick = async (index, isIn) => {
    const data = this.state.data;
    if (isIn) {
      data[index].qty = parseInt(data[index].qty) + parseInt(data[index].editedQty);
    }
    else {
      data[index].qty = parseInt(data[index].qty) - parseInt(data[index].editedQty);
    }
    const db = getFirestore();
    const inventoryRef = doc(db, 'Inventory', data[index].id);
    const updatedData = {
      qty: parseInt(data[index].qty),
    };
    try {
      await updateDoc(inventoryRef, updatedData);
      this.setState({ data }, () => {
        this.addHistory(data[index], db, isIn ? "History" : "Delivered", data[index].editedQty, data[index].outDeliveredTo);
        this.cancelEditMode(index);
      });
    } catch (error) {
      toast.error("Error, Unable to update inventory.");
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

  updateItem = async (index) => {
    const data = this.state.data;
    const user = getAuth().currentUser;

    if (user) {
      const db = getFirestore();
      const inventoryRef = doc(db, "Inventory", data[index].id);

      const updatedData = {
        itemName: data[index].editedItemName,
        companyName: data[index].editedCompanyName
      };
      try {
        await updateDoc(inventoryRef, updatedData);

        data[index].itemName = data[index].editedItemName;
        data[index].companyName = data[index].editedCompanyName;
        this.setState({ data }, () => {
          this.cancelEditMode(index);
          toast.success("Inventory item updated.");
        });
      } catch (error) {
        toast.error("Error, Unable to update inventory item.");
      }
    }
  };

  makeEditable = (index) => {
    if (this.props.admin) {
      const data = this.state.data;
      data[index].editable = true;
      this.setState({ data });
    }
  }

  setItemName = (value, index) => {
    const data = this.state.data;
    const companyName = data[index].editedCompanyName;
    if (!data.find(f => f.itemName.toLowerCase() === value.toLowerCase() && f.companyName.toLowerCase() === companyName.toLowerCase())) {
      data[index].editedItemName = value;
      data[index].edited = true;
      this.setState({ data });
    }
    else {
      toast.error("There is already item with same company name present please update that entry.");
    }
  }

  setCompanyName = (value, index) => {
    const data = this.state.data;
    const itemName = data[index].editedItemName;
    if (!data.find(f => f.companyName.toLowerCase() === value.toLowerCase() && f.itemName.toLowerCase() === itemName.toLowerCase())) {
      data[index].editedCompanyName = value;
      data[index].edited = true;
      this.setState({ data });
    }
    else {
      toast.error("There is already item with same item name present please update that entry.");
    }
  }

  setQty = (value, index, inQty) => {
    const data = this.state.data;
    data[index].editedQty = value;
    data[index].qtyEditable = true;
    if (inQty) {
      data[index].inQty = value;
    }
    else {
      data[index].outQty = value;
    }
    this.setState({ data });
  }

  setDeliveredTo = (value, index) => {
    const data = this.state.data;
    data[index].outDeliveredTo = value;
    data[index].qtyEditable = true;
    this.setState({ data });
  }

  cancelEditMode = (index) => {
    const data = this.state.data;
    data[index].editable = false;
    data[index].edited = false;
    data[index].editedItemName = data[index].itemName;
    data[index].editedCompanyName = data[index].companyName;
    data[index].editedQty = 0;
    data[index].inQty = null;
    data[index].outQty = null;
    data[index].qtyEditable = false;
    data[index].outDeliveredTo = '';
    this.setState({ data });
  }

  onSearch = (value) => {
    let data = this.state.dataFilter.filter(
      (data) =>
        data.companyName.toLowerCase().includes(value) || data.itemName.toLowerCase().includes(value)
        || data.username.toLowerCase().includes(value) || data.qty.toLowerCase().includes(value)
    );
    this.setState({ data })
  }

  getTable() {
    let number = 0;
    let res = this.state.data.map((item, index) => {
      number++;
      return (
        <tr key={index} onDoubleClick={() => this.makeEditable(index)}>
          <th scope="row">{number}</th>
          <td>
            {item.editable && <input type="text" className="form-control" onInput={(event) => this.setItemName(event.target.value, index)} value={item.editedItemName} />}
            {!item.editable && <span>{item.itemName}</span>}
          </td>
          <td>
            {item.editable && <input type="text" className="form-control" onInput={(event) => this.setCompanyName(event.target.value, index)} value={item.editedCompanyName} />}
            {!item.editable && <span>{item.companyName}</span>}
          </td>
          <td>{item.username}</td>
          {this.props.componentName !== "inventory" && this.props.componentName !== "History" &&
            <td>{item.deliveredTo}</td>
          }
          <td>{item.qty}</td>
          <td>{item.created}</td>
          {this.props.componentName === "inventory" && (
            <>
              {this.props.admin &&
                <>
                  <td className="w-10">
                    <div className="d-flex align-items-center gap-1">
                      <input
                        onInput={(e) => this.setQty(e.target.value, index, true)}
                        type="number"
                        value={item.inQty ?? ""}
                        className="form-control"
                      />
                      <button
                        className="btn btn-xs btn-success w-100"
                        disabled={!item.inQty}
                        onClick={() => this.handleButtonClick(index, true)}
                      >
                        In +
                      </button>
                    </div>
                  </td>
                  <td className="w-13" colSpan={1}>
                    <input
                      onInput={(e) => this.setDeliveredTo(e.target.value, index, false)}
                      type="text"
                      value={item.outDeliveredTo ?? ""}
                      className="form-control"
                    />
                  </td>
                  <td className="w-13">
                    <div className="d-flex align-items-center gap-1">
                      <input
                        onInput={(e) => this.setQty(e.target.value, index, false)}
                        type="number"
                        value={item.outQty ?? ""}
                        className="form-control"
                      />
                      <button
                        disabled={!item.outQty || !item.outDeliveredTo}
                        className="btn btn-xs btn-secondary w-100"
                        onClick={() => this.handleButtonClick(index, false)}
                      >
                        Out -
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-info p-1 w-100" disabled={!item.edited || item.editedItemName === '' || item.editedCompanyName === ''} onClick={() => this.updateItem(index)}>
                        <img src={tick} className="tick-size" alt="" />
                      </button>
                      {(item.qtyEditable || item.editable) && <button className="btn btn-danger p-1 w-100" onClick={() => this.cancelEditMode(index)}>
                        <img src={cross} className="cross-size" alt="" />
                      </button>}
                    </div>
                  </td>
                </>
              }
            </>
          )}
        </tr>
      );
    });
    return res;
  }

  getMblTable() {
    let number = 0;
    let res = this.state.data.map((item, index) => {
      number++;
      return (
        <div className="p-3 m-3 rounded" key={index}>
          <div className="d-flex justify-content-between align-items-center border p-2 rounded-t">
            <span className="fw-bold" onClick={() => this.makeEditable(index)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: 'rgba(0, 0, 0, 1)' }}><path d="m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z"></path><path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z"></path></svg>
            </span>
            <span scope="row" className="fw-bold">{number}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center border p-2">
            <span className="fw-bold">Name:</span>
            <span>
              {item.editable && <input type="text" className="form-control" onInput={(event) => this.setItemName(event.target.value, index)} value={item.editedItemName} />}
              {!item.editable && <span>{item.itemName}</span>}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center border p-2">
            <span className="fw-bold">Company Name:</span>
            <span>
              {item.editable && <input type="text" className="form-control" onInput={(event) => this.setCompanyName(event.target.value, index)} value={item.editedCompanyName} />}
              {!item.editable && <span>{item.companyName}</span>}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center border p-2">
            <span className="fw-bold">User Name:</span>
            <span>{item.username}</span>
          </div>

          {this.props.componentName !== "inventory" && this.props.componentName !== "History" &&
            <div className="d-flex justify-content-between align-items-center border p-2">
              <span className="fw-bold">Delivered To:</span>
              <span>{item.deliveredTo}</span>
            </div>
          }

          <div className="d-flex justify-content-between align-items-center border p-2">
            <span className="fw-bold">Qty:</span>
            <span >{item.qty}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center border p-2">
            <span className="fw-bold">Time:</span>
            <span >{item.created}</span>
          </div>

          {this.props.componentName === 'inventory' && (
            <>
              {this.props.admin &&
                <>
                  <div className="d-flex justify-content-between align-items-center border p-2">
                    <span className="fw-bold">Stock In:</span>
                    <div className="d-flex align-items-center gap-1">
                      <input
                        onInput={(e) => this.setQty(e.target.value, index, true)}
                        type="number"
                        value={item.inQty ?? ""}
                        className="form-control d-inline w-50 ms-auto"
                      />
                      <button
                        className="btn btn-xs btn-success ms-auto "
                        disabled={!item.inQty}
                        onClick={() => this.handleButtonClick(index, true)}
                      >
                        In +
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border p-2">
                    <span className="fw-bold">Delievered To:</span>
                    <div className="d-flex align-items-center gap-1">
                      <input
                        onInput={(e) => this.setDeliveredTo(e.target.value, index, false)}
                        type="text"
                        value={item.outDeliveredTo ?? ""}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border p-2">
                    <span className="fw-bold">Stock Out:</span>
                    <div className="d-flex align-items-center gap-1">
                      <input
                        onInput={(e) => this.setQty(e.target.value, index, false)}
                        type="number"
                        value={item.outQty ?? ""}
                        className="form-control d-inline w-50 ms-auto"
                      />
                      <button
                        disabled={!item.outQty}
                        className="btn btn-xs btn-secondary ms-auto"
                        onClick={() => this.handleButtonClick(index, false)}
                      >
                        Out -
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border p-2 rounded-b">
                    <span className="fw-bold">Action:</span>
                    <div className="d-flex gap-2">
                      <button className="btn btn-xs btn-info" disabled={!item.edited || item.editedItemName === '' || item.editedCompanyName === ''} onClick={() => this.updateItem(index)}>
                        <img src={tick} className="tick-size" alt="" />
                      </button>
                      {(item.qtyEditable || item.editable) && <button className="btn btn-xs btn-danger ms-2" onClick={() => this.cancelEditMode(index)}>
                        <img src={cross} className="cross-size" alt="" />
                      </button>}
                    </div>
                  </div>
                </>
              }

            </>
          )}
        </div>
      );
    });
    return res;
  }

  render() {
    if (this.props.data.length === 0)
      return <></>

    return (
      <>
        <div className="col-md-3 d-flex align-items-center gap-1 ">
          <img src={searchImg} className="search-size" alt="" />
          <input
            type="search"
            className="form-control"
            placeholder="Search"
            onInput={(e) => this.onSearch(e.target.value)}
          />
        </div>
        <div className="table-responsive d-none d-md-block">
          <table className="table mt-3 table-bordered">
            <thead className="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Company Name</th>
                <th scope="col">User Name</th>
                {this.props.componentName !== 'inventory' && this.props.componentName !== "History" &&
                  <th scope="col">Delivered To</th>
                }
                <th scope="col">Qty</th>
                <th scope="col">Time</th>
                {this.props.componentName === 'inventory' && (
                  <>
                    {this.props.admin &&
                      <>
                        <th>Stock In</th>
                        <th>Delivered To</th>
                        <th>Stock Out</th>
                        <th>Action</th>
                      </>
                    }
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {this.getTable()}
              {this.props.loading &&
                <tr>
                  <td colSpan={10}><h3>Loading...</h3></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div className="d-lg-none">
          {this.getMblTable()}
          {this.props.loading &&
            <h3>Loading...</h3>
          }
        </div>
        {/* <VisibilitySensor onChange={this.onChange}>
          <span className="op-0">hi</span>
        </VisibilitySensor> */}
      </>
    );
  }
}


Table.propTypes = {
  data: PropTypes.array,
  componentName: PropTypes.string,
  loading: PropTypes.bool,
  admin: PropTypes.bool
}
