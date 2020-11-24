const form = document.getElementById('form')
const input = from.getElementByTagName('input')

let array = []

let addToArray =() =>{
  for(let i = 0; i < input.length; i++){
    if (input[i].checked == true){
      array.push(input[i].name)
    }
  }
}

const a = document.getElementById('validate')

validate.addEventListner('onClick', () => {
  addToArray()
  console.log(array)
})
