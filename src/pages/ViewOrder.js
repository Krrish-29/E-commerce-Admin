import React, { useEffect } from "react";
import { Table } from "antd";
import { useDispatch, useSelector } from "react-redux";
// import { BiEdit } from "react-icons/bi";
// import { AiFillDelete } from "react-icons/ai";
import { useLocation } from "react-router-dom";
import { getaOrder } from "../features/auth/authSlice";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },
  {
    title: "Product Name",
    dataIndex: "name",
  },
  {
    title: "Count",
    dataIndex: "count",
  },
  {
    title: "Color",
    dataIndex: "color",
  },
  {
    title: "Amount",
    dataIndex: "amount",
  },
];

const ViewOrder = () => {
  const location = useLocation();
  const orderId = location.pathname.split("/")[3];
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getaOrder(orderId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const orderState = useSelector((state) => state?.auth?.singleorder?.orders);

  const data1 = [];
  if (orderState?.orderItems) {
    for (let i = 0; i < orderState.orderItems.length; i++) {
      data1.push({
        key: i + 1,
        name: orderState.orderItems[i]?.product?.title,
        count: orderState.orderItems[i]?.quantity,
        amount: orderState.orderItems[i]?.price,
        color: (
          <div className="col-3">
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: orderState.orderItems[i]?.color?.title,
              }}
            ></div>
          </div>
        ),
      });
    }
  }

  return (
    <div>
      <h3 className="mb-4 title">View Order</h3>

      {/* Order Summary */}
      <div className="row bg-white p-3 mb-3">
        <div className="col-3">
          <h6>Order ID:</h6>
          <p>{orderState?._id}</p>
        </div>
        <div className="col-3">
          <h6>Total Amount:</h6>
          <p>Rs. {orderState?.totalPrice}</p>
        </div>
        <div className="col-3">
          <h6>Total After Discount:</h6>
          <p>Rs. {orderState?.totalPriceAfterDiscount}</p>
        </div>
        <div className="col-3">
          <h6>Status:</h6>
          <p><strong>{orderState?.orderStatus}</strong></p>
        </div>
      </div>

      {/* Customer & Shipping Information */}
      <div className="row bg-white p-3 mb-3">
        <div className="col-12">
          <h5 className="mb-3 border-bottom pb-2">Customer & Shipping Information</h5>
        </div>
        <div className="col-md-6">
          <h6>Customer Name:</h6>
          <p>{orderState?.user?.firstname} {orderState?.user?.lastname}</p>

          <h6 className="mt-3">Email:</h6>
          <p>{orderState?.user?.email}</p>

          <h6 className="mt-3">Mobile:</h6>
          <p>{orderState?.user?.mobile || 'N/A'}</p>
        </div>
        <div className="col-md-6">
          <h6>Shipping Address:</h6>
          <p className="mb-1">{orderState?.shippingInfo?.firstName} {orderState?.shippingInfo?.lastName}</p>
          <p className="mb-1">{orderState?.shippingInfo?.address}</p>
          <p className="mb-1">{orderState?.shippingInfo?.city}, {orderState?.shippingInfo?.state}</p>
          <p className="mb-1">{orderState?.shippingInfo?.country} - {orderState?.shippingInfo?.pincode}</p>

          <h6 className="mt-3">Contact Number:</h6>
          <p>{orderState?.shippingInfo?.other || orderState?.user?.mobile}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-3">
        <h5 className="mb-3 border-bottom pb-2">Order Items</h5>
        <Table columns={columns} dataSource={data1} />
      </div>
    </div>
  );
};

export default ViewOrder;
