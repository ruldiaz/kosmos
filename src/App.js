  import React, { useRef, useState, useEffect } from "react";
  import Moveable from "react-moveable";

  const App = () => {
    const [moveableComponents, setMoveableComponents] = useState([]);
    const [selected, setSelected] = useState(null);
    const parentRef = useRef();

    const addMoveable = async () => {
      const COLORS = ["red", "blue", "yellow", "green", "purple"];
    
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/photos");
        const data = await response.json();
    
        const randomPhoto = data[Math.floor(Math.random() * data.length)];
        const imageUrl = randomPhoto.url;
    
        setMoveableComponents((prevComponents) => {
          const newComponent = {
            id: Math.floor(Math.random() * Date.now()),
            top: 0,
            left: 0,
            width: 100,
            height: 100,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            imageUrl: imageUrl,
          };
          return [...prevComponents, newComponent];
        });
      } catch (error) {
        console.error("Failed to fetch photo:", error);
      }
    };
  
  
    const updateMoveable = (id, newComponent) => {
      setMoveableComponents((prevComponents) =>
        prevComponents.map((moveable) => {
          if (moveable.id === id) {
            return { id, ...newComponent };
          }
          return moveable;
        })
      );
    };

    const handleResizeStart = (index, e) => {
      const [handlePosX] = e.direction;

      if (handlePosX === -1) {
        const initialLeft = e.left;
        const initialWidth = e.width;
        console.log(initialWidth)
        e.set([e.left, e.top, e.width, e.height]);
        e.dragStart && e.dragStart.set([initialLeft, e.top]);
        e.drag && e.drag.set([initialLeft, e.top]);
      }
    };

    const removeMoveable = (id) => {
      setMoveableComponents((prevComponents) =>
        prevComponents.filter((moveable) => moveable.id !== id)
      );
      setSelected(null);
    };

    return (
      <main style={{ height: "100vh", width: "100vw" }}>
        <button onClick={addMoveable}>Add Moveable</button>
        <div
          id="parent"
          ref={parentRef}
          style={{
            position: "relative",
            background: "black",
            height: "80vh",
            width: "80vw",
          }}
        >
          {moveableComponents.map((item, index) => (
            <Component
              {...item}
              key={item.id}
              parentRef={parentRef}
              updateMoveable={updateMoveable}
              handleResizeStart={handleResizeStart}
              setSelected={setSelected}
              isSelected={selected === item.id}
            >
              <button onClick={() => removeMoveable(item.id)}>Remove</button>
            </Component>
          ))}
        </div>
      </main>
    );
  };

  const Component = ({
    updateMoveable,
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    imageUrl,
    parentRef,
    setSelected,
    isSelected = false,
    children,
  }) => {
    const ref = useRef();
    const moveableRef = useRef();
    const [nodoReferencia, setNodoReferencia] = useState({
      top,
      left,
      width,
      height,
      index,
      color,
      id,
    });
    console.log(nodoReferencia)

    const [image, setImage] = useState(imageUrl); // Estado para almacenar la URL de la imagen
    console.log(setImage)
    useEffect(() => {
      if (isSelected) {
        setSelected(id);
    
        // Obtiene el tamaño y la posición del div "parent"
        const parentBounds = parentRef.current.getBoundingClientRect();
    
        // Configura los límites del arrastre en base al div "parent"
        moveableRef.current.dragArea = {
          left: 0,
          top: 0,
          right: parentBounds.width - width,
          bottom: parentBounds.height - height,
        };
      }
    }, [isSelected, id, setSelected, parentRef, width, height]);

    useEffect(() => {
      if (isSelected) {
        setSelected(id);
      }
    }, [isSelected, id, setSelected]);

    

    const onResize = (e) => {
      const beforeTranslate = e.drag.beforeTranslate;
      const newWidth = e.width;
      const newHeight = e.height;
    
      // Calculate the background position
      const backgroundPosX = (-beforeTranslate[0] / newWidth) * 100;
      const backgroundPosY = (-beforeTranslate[1] / newHeight) * 100;
    
      // Update the component's style
      ref.current.style.width = `${newWidth}px`;
      ref.current.style.height = `${newHeight}px`;
      ref.current.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
      ref.current.style.backgroundPosition = `${backgroundPosX}% ${backgroundPosY}%`;
    
      // Update the moveable state
      updateMoveable(id, {
        top: top + (beforeTranslate[1] < 0 ? beforeTranslate[1] : 0),
        left: left + (beforeTranslate[0] < 0 ? beforeTranslate[0] : 0),
        width: newWidth - (beforeTranslate[0] < 0 ? beforeTranslate[0] : 0),
        height: newHeight - (beforeTranslate[1] < 0 ? beforeTranslate[1] : 0),
        color,
      });
    
      // Update the reference node state
      setNodoReferencia((prevState) => ({
        ...prevState,
        translateX: beforeTranslate[0],
        translateY: beforeTranslate[1],
        top: top + beforeTranslate[1] < 0 ? 0 : top + beforeTranslate[1],
        left: left + beforeTranslate[0] < 0 ? 0 : left + beforeTranslate[0],
      }));
    };
    

    const onResizeEnd = (e) => {
      const parentBounds = parentRef.current.getBoundingClientRect();
    
      let newWidth = e.width;
      let newHeight = e.height;
      let newLeft = left + e.drag.beforeTranslate[0];
      let newTop = top + e.drag.beforeTranslate[1];
    
      const maxLeft = parentBounds.width - newWidth;
      const maxTop = parentBounds.height - newHeight;
    
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
    
      updateMoveable(id, {
        top: newTop,
        left: newLeft,
        width: newWidth,
        height: newHeight,
        color,
      });
    };
    
    
    const onDrag = (e) => {
      const parentBounds = parentRef.current.getBoundingClientRect();
    
      const newLeft = left + e.delta[0];
      const newTop = top + e.delta[1];
    
      if (newLeft < 0) {
        e.delta[0] = -left;
      } else if (newLeft + width > parentBounds.width) {
        e.delta[0] = parentBounds.width - left - width;
      }
    
      if (newTop < 0) {
        e.delta[1] = -top;
      } else if (newTop + height > parentBounds.height) {
        e.delta[1] = parentBounds.height - top - height;
      }

      
    
      updateMoveable(id, {
        top: top + e.delta[1],
        left: left + e.delta[0],
        width,
        height,
        color,
        imageUrl: image, // mantener la imagen original
      });
    };

    return (
      <>
        <div
          ref={ref}
          className="draggable"
          id={"component-" + id}
          style={{
            position: "absolute",
            top: top,
            left: left,
            width: width,
            height: height,
            background: color,
            backgroundImage: `url(${image})`, // cambiar por image
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={() => setSelected(id)}
        >
          {children}
        </div>

        <Moveable
           ref={moveableRef}
           target={isSelected && ref.current}
           resizable
           draggable
           onDrag={onDrag}
           onResize={onResize}
           onResizeEnd={onResizeEnd}
           keepRatio={false}
           throttleResize={1}
           renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
           edge={false}
           zoom={1}
           origin={false}
           padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        />
      </>
    );
  };

  export default App;
