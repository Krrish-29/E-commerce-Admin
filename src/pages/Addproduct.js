import { React, useEffect, useState } from "react";
import CustomInput from "../components/CustomInput";
import ReactQuill from "react-quill";
import { useLocation,useNavigate } from "react-router-dom";
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
  const [htmlView, setHtmlView] = useState(false);
  const [files, setFiles] = useState([]); // Store local files
  const [existingImages, setExistingImages] = useState([]); // Store existing images for edit

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getColors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const catState = useSelector((state) => state.pCategory.pCategories);
  const colorState = useSelector((state) => state.color.colors);
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
      setFiles([]);
      setExistingImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProductId]);

  // Populate existing data for Edit Mode
  useEffect(() => {
    if (getProductId && isSuccess && productImages) {
      setExistingImages(productImages);
      let colorIds = [];
      if (productColors && productColors.length > 0) {
        colorIds = productColors.map((c) => c._id);
      }
      formik.setValues({
        title: productName,
        description: productDesc,
        price: productPrice,
        category: productCategory,
        tags: productTag,
        color: colorIds,
        quantity: productQuantity,
      });
      setColor(colorIds || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productImages, isSuccess, getProductId,productCategory,productColors,productDesc,productName,productPrice,productTag,productQuantity]);


  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

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
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      let uploadedImages = [...existingImages];

      // Upload new files if any
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        try {
          // Dispatch uploadImg and wait for result. 
          // Note: uploadImg thunk returns the response data on fulfilled.
          // We need to unwrap or handle the promise to get the actual array of image objects.
          const resultAction = await dispatch(uploadImg(files));
          if (uploadImg.fulfilled.match(resultAction)) {
            uploadedImages = [...uploadedImages, ...resultAction.payload];
          } else {
            toast.error("Image upload failed!");
            return;
          }
        } catch (error) {
          toast.error("Error uploading images");
          return;
        }
      }

      const payload = { ...values, images: uploadedImages, color: color };

      if (getProductId !== undefined) {
        const data = { id: getProductId, productData: payload };
        dispatch(updateAProduct(data));
      } else {
        dispatch(createProducts(payload));
      }
    },
  });

  useEffect(() => {
    if (isSuccess && createdProduct) {
      toast.success("Product Added Successfullly!");
      formik.resetForm();
      setColor([]);
      setFiles([]);
      setExistingImages([]);
      dispatch(resetState());
      dispatch(uploadResetState());
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
    if (isSuccess && updatedProduct) {
      toast.success("Product Updated Successfullly!");
      dispatch(resetState());
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      navigate("/admin/list-product");
    }
    if (isError) {
      toast.error("Something Went Wrong!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError, isLoading, createdProduct, updatedProduct]);

  const handleColors = (e) => {
    setColor(e);
  };

  const handleDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (file) => {
    setFiles(prev => prev.filter(f => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  const removeExistingImage = (public_id) => {
    setExistingImages(prev => prev.filter(img => img.public_id !== public_id));
    dispatch(delImg(public_id));
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
              onDrop={handleDrop}
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
            {/* Display Existing Images */}
            {existingImages?.map((i, j) => {
              return (
                <div className=" position-relative" key={j}>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i.public_id)}
                    className="btn-close position-absolute"
                    style={{ top: "10px", right: "10px" }}
                  ></button>
                  <img src={i.url} alt="" width={200} height={200} />
                </div>
              );
            })}

            {/* Display New Files to be uploaded */}
            {files?.map((file, j) => {
              return (
                <div className=" position-relative" key={j + existingImages.length}>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    className="btn-close position-absolute"
                    style={{ top: "10px", right: "10px" }}
                  ></button>
                  <img src={file.preview} alt="" width={200} height={200} />
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
