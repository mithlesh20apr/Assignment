# Pizza API & Client

## /users
New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.
### Post

#### Payload data
##### Required:
+ firstName : string 
+ lastName: string 
+ email: string
+ address: string 
+ password: string 
+ tosAgreement: bool

### Get

#### Query string
+ email
#### Headers (required)
+ token

### Put
#### Payload data
##### required
+ email: string
+ at least one of the optional data.
##### optional
+ firstName : string 
+ lastName: string
+ address: string 
+ password: string 
#### Headers (required)
+ token
### Delete

#### Query string (required)
+ email
#### Headers (required)
+ token

## /tokens
Users can log in and log out by creating or destroying a token.
### Post
#### Payload data
##### required
+ email: string
+ password: string
### Get
#### Query string (required)
+ tokenId
### Put
#### Payload data
##### required
+ tokenId : string
+ extend : boolean
### Delete
#### Query string (required)
+ tokenId : string

## /menu
### Get
When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).
#### Query string (required)
+ email : string
#### Headers (required)
+ tokenId : string
### Post (adds pizzas to shopping cart)
A logged-in user should be able to fill a shopping cart with menu items
#### Query string (required)
+ email: string
#### Headers (required)
+ tokenId : string
+ newPizzas: ['pizzaName']

## /order
A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment.
When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this.
### Post
#### Query string (required)
+ email : string
#### Headers (required)
+ tokenId : string
