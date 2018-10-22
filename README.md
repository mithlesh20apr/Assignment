Homework Assignment #3

It is time to build a simple frontend for the Pizza-Delivery API you created in Homework Assignment #2. Please create a web app that allows customers to:

1. Signup on the site

2. View all the items available to order

3. Fill up a shopping cart

4. Place an order (with fake credit card credentials), and receive an email receipt

This is an open-ended assignment. You can take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well. 


/users
New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

Post
Payload data
Required:
  > firstName : string
  > lastName: string
  > email: string
  > streetAddress: string
  > password: string
  > tosAgreement: bool

Get
Query string
  > email
  > Headers (required)
  > token

/ Token
Post
Required: 

 > email: string
 > password: string

 /Menu
 Get: 
