const mongoose = require('mongoose')
const supertest = require('supertest')
const testHelper = require('./test_helper')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

beforeEach(async()=>{
    await User.deleteMany({})

    const password = '123456'
    const hashedPassword = await bcrypt.hash(password, 10) 
    const user = new User({username:'fingy', name:'Abramov Barislov',hashedPassword, })
    await user.save()
}, 100000)

describe('creating a user', ()=>{
    test('succeeds if username is unique', async()=>{
        const usersatStart = await testHelper.usersInDb()
    
        const user = {username:'kyle', name:'Kyle Walker',password:'blamky', }
    
        await api.post('/api/users')
                .send(user)
                .expect(201)
                .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersatStart.length + 1)
    
        const usernames = usersAtEnd.map(i => i.username)
        expect(usernames).toContain(user.username)
    })
    
    test('fails with proper status code and message if username is not unique', async()=>{
        const usersatStart = await testHelper.usersInDb()
    
        const user = {username:'fingy', name:'Tyler Perry',password:'blamky', }
        const response = await api.post('/api/users')
                                .send(user)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
        expect(response.body.error).toContain('expected `username` to be unique')
    
        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toEqual(usersatStart)
    })
    
    test('fails with proper status code and message if data is invalid', async()=>{
        const usersatStart = await testHelper.usersInDb()
    
        const user = { name:'Tyler Perry',password:'bamboo', }
        const response = await api.post('/api/users')
                                .send(user)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
        expect(response.body.error).toContain('`username` is required')
    
        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toEqual(usersatStart)
    })
    
    test('fails with proper status code and message if password length is less than 3', async()=>{
        const usersatStart = await testHelper.usersInDb()
    
        const user = { username:'tyler',name:'Tyler Perry',password:'ba', }
        const response = await api.post('/api/users')
                                .send(user)
                                .expect(400)
                                .expect('Content-Type', /application\/json/)
        expect(response.body.error).toContain('password must have a minimum length of 3')
    
        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toEqual(usersatStart)
    })
})

afterAll(async()=>{
   await mongoose.connection.close()
})