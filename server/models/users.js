const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a schema
const UserSchema = new mongoose.Schema({
    method: {
        type: String,
        enum : ['local', 'facebook', 'google'],
        default: 'local'
    },
    local: {
        email: {
            type: String,
            
            lowercase: true
        },
        password: {
            type: String,
        } 
    },
    facebook: {
        id: {
            type:String
        },
        email: {
            type: String,
            
            lowercase: true
        }    
    },
    google: {
        id: {
            type:String
        },
        email: {
            type: String,
            
            lowercase: true
        }    
    }
})

UserSchema.pre('save', async function(next) {
    try {
        // check whether method isqual Local
        if(!this.method.includes('local')) {
            next();
        }
            
        const salt = await bcrypt.genSalt(10);
        console.log("salt", salt)
        console.log("called123")
        const hashPassword = await bcrypt.hash(this.local.password, salt);
        console.log("called")
        this.local.password = hashPassword;
        console.log("Password is hashed before save in signup phase: ", this.local.password);
        next();
    } catch (error) {
        next(error);
    } 
})

UserSchema.methods.comparePassword = async function (validatePassword) {
    try {
        return await bcrypt.compare(validatePassword, this.local.password);
    } catch (error) {
        throw new Error(error);
    }
}
// Create a model
const User = mongoose.model("NVB",UserSchema);

module.exports = User;