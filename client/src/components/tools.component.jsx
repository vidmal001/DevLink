import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Code from "@editorjs/code";
import axios from 'axios'

const uploadImageByFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject("No file selected");
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload`, formData)
        .then((res) => {
          const url = res.data.imageUrl;
          if (url) {
            resolve({
              success: 1,
              file: {
                url: `${import.meta.env.VITE_SERVER_DOMAIN}${url}`,
              },
            });
          } else {
            reject("Image upload failed");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

const uploadImageByURL = (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (err) {
      reject(err);
    }
  });

  return link.then((url) => {
    return {
      success: 1,
      file: { url },
    };
  });
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile : uploadImageByFile,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading...",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlinecode: InlineCode,
  code: Code,
};
