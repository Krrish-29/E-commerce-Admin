import { React, useEffect, useState } from "react";
import CustomInput from "../components/CustomInput";
import ReactQuill from "react-quill";
import { useLocation, useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../features/pcategory/pcategorySlice";
import { getColors } from "../features/color/colorSlice";
import { Select } from "antd";
import Dropzone from "react-dropzone";
import { delImg, uploadImg, resetState as uploadResetState } from "../features/upload/uploadSlice";
import {
  createProducts,
  getAProduct,
  resetState,
  updateAProduct,
} from "../features/product/productSlice";
// import { base_url } from "../utils/baseUrl";
let schema = yup.object().shape({
  title: yup.string().required("Title is Required"),
  description: yup.string().required("Description is Required"),
  price: yup.number().required("Price is Required"),
  category: yup.string().required("Category is Required"),
  tags: yup.string().required("Tag is Required"),
  color: yup
    .array()
    .min(1, "Pick at least one color")
    .required("Color is Required"),
  quantity: yup.number().required("Quantity is Required"),
});

const Addproduct = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const getProductId = location.pathname.split("/")[3];
  const navigate = useNavigate();
  const [color, setColor] = useState([]);
  // const [images, setImages] = useState([]);
  const [htmlView, setHtmlView] = useState(false);
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getColors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const catState = useSelector((state) => state.pCategory.pCategories);
  const colorState = useSelector((state) => state.color.colors);
  const imgState = useSelector((state) => state?.upload?.images);
  const newProduct = useSelector((state) => state.product);
  const {
    isSuccess,
    isError,
    isLoading,
    createdProduct,
    updatedProduct,
    productName,
    productDesc,
    productPrice,
    // productBrand,
    productCategory,
    productTag,
    productColors,
    productQuantity,
    productImages,
  } = newProduct;

  useEffect(() => {
    if (getProductId !== undefined) {
      dispatch(getAProduct(getProductId));
    } else {
      dispatch(resetState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProductId]);
  useEffect(() => {
    if (isSuccess && createdProduct) {
      toast.success("Product Added Successfullly!");
    }
    if (isSuccess && updatedProduct) {
      toast.success("Product Updated Successfullly!");
      navigate("/admin/list-product");
    }
    if (isError) {
      toast.error("Something Went Wrong!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError, isLoading]);
  const coloropt = [];
  colorState.forEach((i) => {
    coloropt.push({
      label: (
        <div className="col-12">
          <p>{i.title}</p>
          <ul
            className="colors ps-0"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: i.title,
              listStyle: "none",
              margin: 0,
              border: "1px solid #333"
            }}
          ></ul>
        </div>
      ),
      value: i._id,
    });
  });

  const productcolor = [];
  productColors?.forEach((i) => {
    productcolor.push({
      label: (
        <div className="col-12">
          <p>{i.title}</p>
          <ul
            className="colors ps-0"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: i.title,
              listStyle: "none",
              margin: 0,
              border: "1px solid #333"
            }}
          ></ul>
        </div>
      ),
      value: i._id,
    });
  });

  // Removed useEffect that was trying to sync imgState to formik
  // We now handle this directly in onSubmit to avoid race conditions with enableReinitialize

  const imgshow = productImages?.map((i) => ({
    public_id: i.public_id,
    url: i.url,
  })) || [];

  useEffect(() => {
    formik.setFieldValue("color", color ? color : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: productName || "",
      description: productDesc || "",
      price: productPrice || "",
      category: productCategory || "",
      tags: productTag || "",
      color: productColors || "",
      quantity: productQuantity || "",
      images: productImages || "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      // Manually construct images array from Redux state to ensure it's up to date
      const finalImages = imgState.map((i) => ({
        public_id: i.public_id,
        url: i.url,
      }));

      const payload = { ...values, images: finalImages };

      if (getProductId !== undefined) {
        const data = { id: getProductId, productData: payload };
        dispatch(updateAProduct(data));
      } else {
        dispatch(createProducts(payload));
        formik.resetForm();
        setColor([]);
        setTimeout(() => {
          dispatch(resetState());
          dispatch(uploadResetState()); // Reset upload slice
        }, 3000);
      }
    },
  });
  const handleColors = (e) => {
    setColor(e);
  };

  return (
    <div>
      <h3 className="mb-4 title">
        {getProductId !== undefined ? "Edit" : "Add"} Product
      </h3>
      <div>
        <form
          onSubmit={formik.handleSubmit}
          className="d-flex gap-3 flex-column"
        >
          <CustomInput
            type="text"
            label="Enter Product Title"
            name="title"
            onChng={formik.handleChange("title")}
            onBlr={formik.handleBlur("title")}
            val={formik.values.title}
          />
          <div className="error">
            {formik.touched.title && formik.errors.title}
          </div>
          <div className="">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="mb-0">Description</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setHtmlView(!htmlView)}
              >
                {htmlView ? "Switch to Editor" : "Edit as HTML"}
              </button>
            </div>
            {htmlView ? (
              <textarea
                name="description"
                className="form-control"
                rows="10"
                onChange={formik.handleChange("description")}
                value={formik.values.description}
                placeholder="Enter HTML or text description..."
              />
            ) : (
              <ReactQuill
                theme="snow"
                name="description"
                onChange={(val) => {
                  formik.setFieldValue("description", val);
                }}
                value={formik.values.description}
              />
            )}
          </div>
          <div className="error">
            {formik.touched.description && formik.errors.description}
          </div>
          <CustomInput
            type="number"
            label="Enter Product Price"
            name="price"
            onChng={formik.handleChange("price")}
            onBlr={formik.handleBlur("price")}
            val={formik.values.price}
          />
          <div className="error">
            {formik.touched.price && formik.errors.price}
          </div>
          <select
            name="category"
            onChange={formik.handleChange("category")}
            onBlur={formik.handleBlur("category")}
            value={formik.values.category}
            className="form-control py-3 mb-3"
            id=""
          >
            <option value="">Select Category</option>
            {catState.map((i, j) => {
              return (
                <option key={j} value={i.title}>
                  {i.title}
                </option>
              );
            })}
          </select>
          <div className="error">
            {formik.touched.category && formik.errors.category}
          </div>
          <select
            name="tags"
            onChange={formik.handleChange("tags")}
            onBlur={formik.handleBlur("tags")}
            value={formik.values.tags}
            className="form-control py-3 mb-3"
            id=""
          >
            <option value="" disabled>
              Select Category
            </option>
            <option value="premium">Premium</option>
            <option value="popular">Popular</option>
            <option value="special">Special</option>
          </select>
          <div className="error">
            {formik.touched.tags && formik.errors.tags}
          </div>

          <Select
            mode="multiple"
            allowClear
            className="w-100"
            placeholder="Select colors"
            value={color}
            onChange={(i) => handleColors(i)}
            options={coloropt}
          />
          <div className="error">
            {formik.touched.color && formik.errors.color}
          </div>
          <CustomInput
            type="number"
            label="Enter Product Quantity"
            name="quantity"
            onChng={formik.handleChange("quantity")}
            onBlr={formik.handleBlur("quantity")}
            val={formik.values.quantity}
          />
          <div className="error">
            {formik.touched.quantity && formik.errors.quantity}
          </div>
          <div className="bg-white border-1 p-5 text-center">
            <Dropzone
              onDrop={(acceptedFiles) => dispatch(uploadImg(acceptedFiles))}
            >
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>
                      Drag 'n' drop some files here, or click to select files
                    </p>
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
          <div className="showimages d-flex flex-wrap gap-3">
            {imgState?.map((i, j) => {
              return (
                <div className=" position-relative" key={j}>
                  <button
                    type="button"
                    onClick={() => dispatch(delImg(i.public_id))}
                    className="btn-close position-absolute"
                    style={{ top: "10px", right: "10px" }}
                  ></button>
                  <img src={i.url} alt="" width={200} height={200} />
                </div>
              );
            })}
          </div>
          <button
            className="btn btn-success border-0 rounded-3 my-5"
            type="submit"
          >
            {getProductId !== undefined ? "Edit" : "Add"} Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addproduct;
