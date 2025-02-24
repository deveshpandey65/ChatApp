const mongoose = require('../connections/db');
const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        profilepic: {
            type: String ,
            default: 'https://static-00.iconduck.com/assets.00/profile-default-icon-512x511-v4sw4m29.png'
        },
        friends:{
            type: [{type: mongoose.Schema.Types.ObjectId,ref: 'User'}],
            default: []
        },
        groups:{
            type: [{type: mongoose.Schema.Types.ObjectId,ref: 'Group'}],
            default: []
        },
        about: {
            type: String,
            default: ''
        },
        online: {
            type: Boolean,
            default: false
        },
        lastseen: {
            type: Date,
            default: Date.now
        },

    }
)
const MessageSchema = mongoose.Schema(
    {
        senderId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiverId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            },
        message: {
            type: String,
        },
        file:{
            type: String

        },
        read: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
)
const oneoneconversationalSchema=mongoose.Schema(
    {
        participantes:{
            type: [{type: mongoose.Schema.Types.ObjectId,ref: 'Users'}],
            default: []
        },
        messages:{
            type:[{type:mongoose.Schema.Types.ObjectId,ref:'Messages'}],
            default:[]
        }
    }
)
const groupconversationalSchema = mongoose.Schema(
    {
        groupId: {
            type: String,
            required: true
        },
        participantes: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
            default: []
        },
        messages: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Messages' }],
            default: []
        },
        profilepic:{
            type:String,
            default:'https://cdn.pixabay.com/photo/2020/05/29/13/26/icons-5235125_1280.png'

        },
        timestamp:{
            type:Date,
            default:Date.now
        }

    }
)
module.exports = {
    UserSchema: UserSchema,
    MessageSchema: MessageSchema,
    oneoneconversationalSchema:oneoneconversationalSchema,
    groupconversationalSchema: groupconversationalSchema,
}
