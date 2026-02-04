import React, { useEffect } from "react";
import { Table } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { BiEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import { getOrders, updateAOrder } from "../features/auth/authSlice";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },
  {
    title: "Order ID",
    dataIndex: "orderId",
  },
  {
    title: "Customer Name",
    dataIndex: "customer",
  },
  {
    title: "Mobile",
    dataIndex: "mobile",
  },
  {
    title: "Total Amount",
    dataIndex: "amount",
  },
  {
    title: "After Discount",
    dataIndex: "amountAfterDiscount",
  },
  {
    title: "Date",
    dataIndex: "date",
  },
  {
    title: "Status",
    dataIndex: "status",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const Orders = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrders());
  }, []);

  const orderState = useSelector((state) => state?.auth?.orders.orders);

  const data1 = [];
  for (let i = 0; i < orderState?.length; i++) {
    data1.push({
      key: i + 1,
      orderId: orderState[i]?._id,
      customer: `${orderState[i]?.user?.firstname || ''} ${orderState[i]?.user?.lastname || ''}`.trim() || 'N/A',
      mobile: orderState[i]?.shippingInfo?.other || orderState[i]?.user?.mobile || 'N/A',
      amount: `Rs. ${orderState[i]?.totalPrice}`,
      amountAfterDiscount: `Rs. ${orderState[i]?.totalPriceAfterDiscount}`,
      date: new Date(orderState[i]?.createdAt).toLocaleString(),
      status: orderState[i]?.orderStatus,
      action: (
        <>
          <Link
            to={`/admin/order/${orderState[i]?._id}`}
            className="fs-5 text-primary me-3"
          >
            <BiEdit />
          </Link>
          <select
            name=""
            defaultValue={orderState[i]?.orderStatus}
            onChange={(e) =>
              updateOrderStatus(orderState[i]?._id, e.target.value)
            }
            className="form-control form-select"
            id=""
          >
            <option value="Ordered">
              Ordered
            </option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </>
      ),
    });
  }

  const updateOrderStatus = (a, b) => {
    dispatch(updateAOrder({ id: a, status: b }));
  };

  return (
    <div>
      <h3 className="mb-4 title">Orders</h3>
      <div>
        <Table columns={columns} dataSource={data1} />
      </div>
    </div>
  );
};

export default Orders;
