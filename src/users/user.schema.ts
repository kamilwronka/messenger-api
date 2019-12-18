import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'validator';

const Schema = mongoose.Schema;

export const UserSchema = new Schema(
  {
    online: {
      type: Boolean,
      required: true,
      default: false,
    },
    pushNotificationsToken: {
      type: String,
      required: false,
    },
    lastOnline: {
      type: Date,
      required: false,
      default: null,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
      validate: {
        validator: isEmail,
        message: '{VALUE} is not a valid email',
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    username: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    backgroundImage: {
      type: String,
      required: false,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User',
      },
    ],
    conversations: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Conversation',
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Request',
      },
    ],
    requestsSent: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Request',
      },
    ],
  },
  { timestamps: true },
);

UserSchema.pre('save', function(next) {
  let user = this;

  // Make sure not to rehash the password if it is already hashed
  if (!user.isModified('password')) return next();

  // Generate a salt and use it to hash the user's password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.checkPassword = function(attempt, callback) {
  let user = this;

  bcrypt.compare(attempt, user.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};
