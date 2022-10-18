if(!$args){
    Write-Output "Falta la variable de entorno" 
}else{
	$entorno=$args
	$secretos=$(az keyvault secret list --vault-name kv-$entorno-admisiondigital --query [].name --query "[?contains(@.name, 'MSMWARE')].name" -o tsv)
	dir "." > .env
	Clear-Content .env
	foreach ($item in $secretos) { 
		$valor=$(az keyvault secret show --name $item --vault-name kv-$entorno-admisiondigital --query "value")
		$name=$item.replace('MSMWARE-','')
		"$name=$valor" | Add-Content .env
	}
	Write-Output "Configuracion realizada" 	
}