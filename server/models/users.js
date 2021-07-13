const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a schema
const UserSchema = new mongoose.Schema({
    methods: {
        type: [String],
        require: true
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
    },
    isActivated: {
        type: Boolean,
        default: false
    }
})

UserSchema.pre('save', async function(next) {
    try {
        // check whether method isqual Local
        if(!this.methods.includes('local')) {
            next();
        }
        //the user schema is instantiated
        const user = this;
        //check if the user has been modified to know if the password has already been hashed
        if (!user.isModified('local.password')) {
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