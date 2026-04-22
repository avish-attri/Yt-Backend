import { asyncHandler } from "../utilis/asyncHandler.js";
import {ApiErrors} from "../utilis/ApiErrors.js";
import {User} from "../models/user.model.js";
import {uploadToCloudinary} from "../utilis/cloudinary.js";
import { ApiResponse } from "../utilis/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) => {
    // get user details from frontend
    // validation not empty
    // check if user already exists
    // check for img, specifically avatar
    // upload them to cloudinary (avatar)
    // create user obj - create entry in db
    // remove passwords, refresh token field in response
    // check for user creation
    // return res


    // 1
    const {fullname, username, email, password} = req.body;
    console.log(email);

    // 2
    if(
        [fullname, username, email, password].some((field)=>
    field?.trim() === "")
    ){
        throw new ApiErrors(400, "All fields are required");
    }

    // 3
    const existedUser = User.findOne(
        {$or: [{username},{email}]}
    );

    if(existedUser){
        throw new ApiErrors(409,"Username or email already exists!");
    }

    // 4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiErrors(400,"Avatar is reuqired");
    }

    // 5
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiErrors(400,"Avatar is reuqired");
    }

    // 6
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // 7
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userCreated){
        throw new ApiErrors(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200,userCreated,"User created successfully")
    )
});

export {registerUser};