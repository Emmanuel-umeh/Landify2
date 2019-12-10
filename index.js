const contractSource = `
payable contract LandRegistration =
  
    
  record landDetails = 
    {
    id : int,
    name : string,
    creatorAddress : address,
    image1 : string,
    image2 : string,
    description : string,
    price : int,
    timestamp : int,
    coordinateX : int,
    coordinateY : int
    }
    
  record state = {
    lands : map(int, landDetails),
    landLength : int}
    
  entrypoint init() = { 
    lands = {},
    landLength = 0}

  
  entrypoint getLand(index : int) = 
    switch(Map.lookup(index, state.lands))
      None => abort("Land does not exist with this index")
      Some(x) => x  
    
    
    //Registers a Land
    
  payable stateful entrypoint createLand( image1' : string, image2' : string, name' : string, description' : string, price' : int, coordinateX' : int, coordinateY' : int) = 
    let timestamp = Chain.timestamp
    let landReg = {
      id = getLandLength()+1,
      name = name', 
      creatorAddress  = Call.caller,
      image1 = image1',
      image2 = image2',
      
      description = description',
      price= price',
      timestamp = timestamp,
      coordinateX = coordinateX',
      coordinateY = coordinateY' }
    
    let index = getLandLength() + 1
    put(state{lands[index] = landReg, landLength = index})
    
    
    //returns lenght of lands registered
  entrypoint getLandLength() : int = 
    state.landLength
  
    `;


const contractAddress = 'ct_9ZgNgkF61QCAwm7D8bNf5Usa5pGFsiZ1p5X6daCWsdHamPbC4';
var LandArray = [];
var client = null;
var LandLength = 0;


function renderLand() {
    
    var template = $('#template').html();

    Mustache.parse(template);
    var rendered = Mustache.render(template, {
        LandArray
    });




    $('#body').html(rendered);
    console.log("for loop reached")
}
//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
    //Create a new contract instance that we can interact with
    const contract = await client.getContractInstance(contractSource, {
        contractAddress
    });
    //Make a call to get data of smart contract func, with specefied arguments
    console.log("Contract : ", contract)
    const calledGet = await contract.call(func, args, {
        callStatic: true
    }).catch(e => console.error(e));
    //Make another call to decode the data received in first call
    console.log("Called get found: ", calledGet)
    const decodedGet = await calledGet.decode().catch(e => console.error(e));
    console.log("catching errors : ", decodedGet)
    return decodedGet;
}

async function contractCall(func, args, value) {
    const contract = await client.getContractInstance(contractSource, {
        contractAddress
    });
    //Make a call to write smart contract func, with aeon value input
    const calledSet = await contract.call(func, args, {
        amount: value
    }).catch(e => console.error(e));

    return calledSet;
}

// Shows the register Form
$('#newregister').click(async function(){
  $('#formbody').show();
})




window.addEventListener('DOMContentLoaded', async () => {


  $('#formBody').hide();
    
    $(".loading").show();

    client = await Ae.Aepp()

    LandLength = await callStatic('getLandLength', []);


    for (let i = 1; i <= LandLength; i++) {
        const property = await callStatic('getLand', [i]);

        console.log("for loop reached", "pushing to array")

        console.log(property.name)
        console.log(property.description)
        console.log(property.image1)


        LandArray.push({
            id: property.id,
            ids: property.id,

            creatorAddress: property.creatorAddress,
            image1: property.image1,
            image2: property.image2,


            name: property.name,
            description: property.description,
            price: property.price,
            xCordinate : property.coordinateX,
            yCordinate : property.coordinateY
        })


        renderLand();

        

        


        $('#formBody').show();

        $(".loading").hide();
    }
});




$('.regBtns').click(async function(){
  $(".loading").show();
  console.log("Button Clicked")
  const land_name = ($('#Regname').val());
  const land_image1 = ($("#Regimg").val());
  const land_image2 = ($("#Regimg2").val());
  const land_price = ($("#Regprice").val());
  const land_description = ($("#Regdescription").val());
  const xCordinate = ($("#coordinateX").val());
  const yCordinate = ($("#coordinateY").val());


  console.log("-------------------------------------")
  console.log("Name:",land_name)
  console.log("image1:",land_image1)
  console.log("Image2:",land_image2)
  console.log(xCordinate)
  console.log(yCordinate)

  

  const new_land = await contractCall('createLand', [land_image1, land_image2, land_name,land_description, land_price, xCordinate, yCordinate],parseInt(land_price, 10));
  console.log("SAVED TO THE DB", new_land)

  LandArray.push({
    id: LandArray.length + 1,
    ids: LandArray.length + 1,
    image1: new_land.image1,
    image2: new_land.image2,

    name: new_land.name,
    description: new_land.description,
    price: new_land.price,
    xCordinate : new_land.xCordinate,
    yCordinate : new_land.yCordinate
  })


  renderLand();
  

  $(".loading").hide(); 
  location.reload(true);

});

$('#body').on('click', '.location', async function(event){
  console.log("location button clicked")
  dataIndex  = event.target.id
  console.log(dataIndex)
  required  = await callStatic('getLand', [dataIndex])
  console.log("Y coordinate" , required.coordinateY)

  console.log("position"+dataIndex)

  const mapDisplayElement = document.getElementById('map2');
        // The address is Uluru
        // Run the initMap() function imidiately, 
        (initMap = () => {
          const address = {lat: required.coordinateX, lng: required.coordinateY};
          // The zoom property specifies the zoom level for the map. Zoom: 0 is the lowest zoom,and displays the entire earth.
          const map = new google.maps.Map(mapDisplayElement, { zoom: 4, center: address });
          const marker = new google.maps.Marker({ position: address, map });
        })();


} )







