import React, { useRef, useState,useEffect } from "react";

export let  activeTabLineRef;
export let   activeTabRef ;
const InPageNavigation = ({ routes,defaultHidden = [ ], defaultActiveIndex = 0 ,children}) => {
  activeTabLineRef = useRef();
  activeTabRef = useRef();

  let [InPageNavIndex, setInpageNavIndex] = useState(defaultActiveIndex);
  let [width, setWidth] = useState(window.innerWidth);
  let [isResizeEventAdded,setIsResizeEventAdded] = useState(false);

  const changePageState = (btn, i) => {
    let { offsetWidth, offsetLeft } = btn;
    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";

    setInpageNavIndex(i);
  };

  useEffect(() => {

    if(width > 766 && InPageNavIndex !== defaultActiveIndex){
      changePageState(activeTabRef.current, defaultActiveIndex); 
    }

    if(!isResizeEventAdded){
       window.addEventListener('resize',()=>{
          if(!isResizeEventAdded){
            setIsResizeEventAdded(true);
          }
          setWidth(window.innerWidth);
       })
    }
  }, [width]);



  return (
    <>
      <div className="relative mb-8 bg-white border-b border-gray3 flex-nowrap oveflow-x-auto">
        {routes.map((route, i) => {
          return (
            <button
              ref ={i == defaultActiveIndex ? activeTabRef : null}
              key={i}
              className={
                "p-4 px-5 capitalize " +
                ( InPageNavIndex == i ? "text-black " : "text-dark-grey ") + 
                ( defaultHidden.includes(route) ? "md:hidden" :""
                )}
              onClick={(e) => {
                changePageState(e.target, i);
              }}
            >
              {route}
            </button>
          );
        })}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>

      {Array.isArray(children) ? children[InPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
