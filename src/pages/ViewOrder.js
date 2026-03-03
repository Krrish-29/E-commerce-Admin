import React, { useEffect } from "react";
import { Table } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getaOrder, updateAOrder } from "../features/auth/authSlice";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },
  {
    title: "Image",
    dataIndex: "image",
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

  const updateOrderStatus = (value) => {
    dispatch(updateAOrder({ id: orderId, status: value }));
    setTimeout(() => {
      dispatch(getaOrder(orderId));
    }, 300);
  };

  const data1 = [];
  if (orderState?.orderItems) {
    for (let i = 0; i < orderState.orderItems.length; i++) {
      const item = orderState.orderItems[i];
      const imgUrl = item?.product?.images?.[0]?.url;
      const fullImgUrl = imgUrl?.startsWith("/")
        ? `${process.env.REACT_APP_API_BASE_URL || ""}${imgUrl}`
        : imgUrl;

      data1.push({
        key: i + 1,
        image: imgUrl ? (
          <img
            src={fullImgUrl}
            alt={item?.product?.title || "product"}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "contain",
              borderRadius: "6px",
              border: "1px solid #eee",
            }}
          />
        ) : (
          <span className="text-muted small">No image</span>
        ),
        name: item?.product?.title || "N/A",
        count: item?.quantity,
        amount: `Rs. ${Number(item?.price).toFixed(2)}`,
        color: item?.color?.title ? (
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: item?.color?.title,
              border: "1px solid #ddd",
            }}
          ></div>
        ) : (
          <span className="text-muted small">N/A</span>
        ),
      });
    }
  }

  return (
    <div>
      <h3 className="mb-4 title">View Order</h3>

      {/* Order Summary */}
      <div className="row bg-white p-3 mb-3 rounded" style={{ border: "1px solid #ebedf2" }}>
        <div className="col-6 col-md-3 mb-3 mb-md-0">
          <h6 className="text-muted small mb-1">Order ID</h6>
          <p className="mb-0 fw-bold text-break" style={{ fontSize: "13px" }}>{orderState?._id}</p>
        </div>
        <div className="col-6 col-md-2 mb-3 mb-md-0">
          <h6 className="text-muted small mb-1">Total Price</h6>
          <p className="mb-0 fw-bold">Rs. {Number(orderState?.totalPrice).toFixed(2)}</p>
        </div>
        <div className="col-6 col-md-2 mb-3 mb-md-0">
          <h6 className="text-muted small mb-1">Delivery Charge</h6>
          <p className="mb-0">Rs. {orderState?.shippingInfo?.deliveryCharge ?? 100}</p>
        </div>
        <div className="col-6 col-md-2 mb-3 mb-md-0">
          <h6 className="text-muted small mb-1">Amount Paid</h6>
          <p className="mb-0 fw-bold text-success">Rs. {Number(orderState?.totalPriceAfterDiscount).toFixed(2)}</p>
          {orderState?.totalPrice !== orderState?.totalPriceAfterDiscount && (
            <span className="text-muted small" style={{ textDecoration: "line-through" }}>
              Rs. {Number(orderState?.totalPrice).toFixed(2)}
            </span>
          )}
        </div>
        <div className="col-6 col-md-1 mb-3 mb-md-0">
          <h6 className="text-muted small mb-1">Date</h6>
          <p className="mb-0" style={{ fontSize: "13px" }}>
            {orderState?.createdAt
              ? new Date(orderState.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        <div className="col-6 col-md-2">
          <h6 className="text-muted small mb-1">Status</h6>
          <span
            className={`badge rounded-pill px-3 py-2 ${orderState?.orderStatus === "Pending"
              ? "bg-info"
              : orderState?.orderStatus === "Delivered"
                ? "bg-success"
                : orderState?.orderStatus === "Cancelled"
                  ? "bg-danger"
                  : "bg-warning text-dark"
              }`}
            style={{ fontSize: "12px" }}
          >
            {orderState?.orderStatus}
          </span>
          <select
            className="form-control form-select mt-2"
            defaultValue={orderState?.orderStatus}
            key={orderState?.orderStatus}
            onChange={(e) => updateOrderStatus(e.target.value)}
            style={{ maxWidth: "180px" }}
          >
            <option value="Pending">Pending</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Customer & Shipping Information */}
      <div className="row bg-white p-3 mb-3 rounded" style={{ border: "1px solid #ebedf2" }}>
        <div className="col-12">
          <h5 className="mb-3 border-bottom pb-2">Customer & Shipping Information</h5>
        </div>
        <div className="col-md-6">
          <h6>Customer Name:</h6>
          <p>{orderState?.user?.firstname} {orderState?.user?.lastname}</p>

          <h6 className="mt-3">Email:</h6>
          <p>{orderState?.user?.email}</p>

          <h6 className="mt-3">Mobile:</h6>
          <p>{orderState?.user?.mobile || "N/A"}</p>
        </div>
        <div className="col-md-6">
          <h6>Shipping Address:</h6>
          <p className="mb-1">{orderState?.shippingInfo?.firstname} {orderState?.shippingInfo?.lastname}</p>
          <p className="mb-1">{orderState?.shippingInfo?.address}</p>
          <p className="mb-1">{orderState?.shippingInfo?.city}, {orderState?.shippingInfo?.state}</p>
          <p className="mb-1">{orderState?.shippingInfo?.country} - {orderState?.shippingInfo?.pincode}</p>

          <h6 className="mt-3">Contact Number:</h6>
          <p>{orderState?.shippingInfo?.other || orderState?.user?.mobile}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-3 rounded" style={{ border: "1px solid #ebedf2" }}>
        <h5 className="mb-3 border-bottom pb-2">Order Items</h5>
        <Table columns={columns} dataSource={data1} />
      </div>
    </div>
  );
};

export default ViewOrder;
