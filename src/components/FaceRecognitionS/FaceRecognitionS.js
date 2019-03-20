import React from 'react';
import './FaceRecognitionS.css'

const FaceRecognitionS = ({imageUrl, box}) => {
    return (
        <div className='center ma'>
            <div className='absolute mt2'>
                <img id = 'inputImage' alt='' src={imageUrl} width='500px' height='auto'  /> 
                <div className='bounding-box' style={{ top: box.topRow, right: box.rightCol, bottom: box.botRow, left: box.leftCol}}></div>
            </div>
        </div>
    );
}

export default FaceRecognitionS;