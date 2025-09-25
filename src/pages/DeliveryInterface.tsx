import React from 'react';
import { useNavigate } from 'react-router-dom';
import UberStyleInterface from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        

const DeliveryInterface = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full">
      <UberStyleInterface onClose={handleClose} />
    </div>
  );
};

export default DeliveryInterface;
