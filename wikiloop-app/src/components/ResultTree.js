import React, { useRef, useEffect, useState } from 'react';
import './resultTree.css';
import { Canvas, Node } from 'reaflow';

const ResultTree = ({ inputs, socket }) => {

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [goodNodes, setGoodNodes] = useState([{ id: 'https://en.wikipedia.org/wiki/Philosophy', text: 'Philosophy', data: { userEntered: 'true' } }]);
  const [goodEdges, setGoodEdges] = useState([]);

  const [graphHeight, setGraphHeight] = useState(100);

  const yPosition = useRef(30);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [visitedArticles, setVisitedArticles] = useState([]);
  const [badArticles, setBadArticles] = useState([]);
  const [createNode, setCreateNode] = useState(false);
  const [firstNode, setFirstNode] = useState(true);
  const containerRef = useRef(null);

  const addNode = (node) => {
    setNodes((nodes) => [...nodes,{ id: node, text: getTitleFromLink(node), data: { userEntered: 'false' } }]);
    setGraphHeight(graphHeight + 125);
  };

  useEffect(() => {
    const updateGraph = async () => {
      const currUrl = inputs.length > 0 ? inputs[inputs.length - 1] : null;
      if (currUrl) {
        setVisitedArticles([currUrl]);
        setNodes((nodes) => [...nodes,{ id: currUrl, text: getTitleFromLink(currUrl), data: { userEntered: 'true' } }]);
        setGraphHeight(graphHeight + 125);
        setCreateNode(true);
      }
    };

    updateGraph();
  }, [inputs]);
  

  useEffect(() => {
    
    if (createNode) {
      socket.on('next-link', (nextLink) => {
        setVisitedArticles((visitedArticles) => [...visitedArticles, nextLink]);
      });

      socket.on('dead-page', (deadLink) => {
        setBadArticles((badArticles) => [...badArticles, deadLink]);
      });

      socket.on('loop', (loopLink) => {
        setVisitedArticles((visitedArticles) => [...visitedArticles, loopLink]);
      });
    }

    return () => {
      socket.off('next-link');
    };
  }, [createNode]);

  useEffect(() => {
    const length = visitedArticles.length;
    if (visitedArticles.length > 1) {
      const currUrl = visitedArticles[length - 1];
      const prevUrl = visitedArticles[length - 2];

      if(goodNodes.some((node) => node.id === currUrl)){
        setGoodNodes((goodNodes) => [...goodNodes, ...nodes]);
        setGoodEdges((goodEdges) => [...goodEdges, ...edges, { id: getTitleFromLink(prevUrl)+' - '+getTitleFromLink(currUrl) ,from: prevUrl, to: currUrl }]);
        setNodes([]);
        setEdges([]);
      }
      else{
        addNode(currUrl);
        setEdges((edges) => [...edges, { id: getTitleFromLink(prevUrl)+' - '+getTitleFromLink(currUrl) ,from: prevUrl, to: currUrl }]);
      }

     
    }
  } , [visitedArticles]);

    
  return( 
    <div >
      <Canvas
        nodes={[...goodNodes, ...nodes]}
        edges={[...goodEdges, ...edges]}
        height={950}
        maxWidth={1000}
        maxHeight={graphHeight}
        node={ (node) => (
          <Node {...node}
            onClick={() => { window.open(node.id, '_blank')}  } 
            style={{ fill: node.properties.data?.userEntered === 'true' ? '#ff7070' : '#2b2c3e' }}
          />
        )
          }
      />
    </div>
  );

};

function getTitleFromLink(link) {
  if (typeof link !== 'string') {
    return link; 
  }

  const titleMatch = link.match(/\/wiki\/(.+)/);
  return titleMatch ? titleMatch[1] : link;
}


export default ResultTree;