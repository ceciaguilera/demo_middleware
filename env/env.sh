#!/bin/bash
if [ -z "$1" ]
then
    echo "Falta la variable de entorno" 
else
  secretos=$(az keyvault secret list --vault-name kv-$1-admisiondigital --query [].name --query "[?contains(@.name, 'MSMWARE')==\`true\`].name")
  items=$(echo "$secretos" | jq -c -r '.[]')
  if [[ -f .env ]];
  then
      echo "Se borra .env anterior"
    rm .env
  fi
  touch .env
  for item in $items
  do
    namefixed=$(echo $item | sed 's/MSMWARE-//')
    valor=$(az keyvault secret show --name $item --vault-name kv-$1-admisiondigital --query "value")
    echo "$namefixed=$valor" >> .env
  done
  echo "Configuracion realizada"
fi
