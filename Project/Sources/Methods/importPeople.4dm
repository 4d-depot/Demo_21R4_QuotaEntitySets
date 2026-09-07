//%attributes = {}


$file:=Folder:C1567(fk resources folder:K87:11).file("people.json")


$fileContent:=$file.getText()

$jsonData:=JSON Parse:C1218($fileContent)


$notDropped:=ds:C1482.People.all().drop()

$importedPeople:=ds:C1482.People.fromCollection($jsonData)