import { asyncHandler } from "../utilis/asyncHandler.js";
import {ApiErrors} from "../utilis/ApiErrors.js";
import {User} from "../models/user.model.js";
import {uploadToCloudinary} from "../utilis/cloudinary.js";
import { ApiResponse } from "../utilis/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiErrors(500, "something went wrong while generating access n refresh tokens");
    }
}

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
    // console.log("req.body ",req.body);

    // 2
    if(
        [fullname, username, email, password].some((field)=>
    field?.trim() === "")
    ){
        throw new ApiErrors(400, "All fields are required");
    }

    // 3
    const existedUser = await User.findOne(
        {$or: [{username},{email}]}
    );

    if(existedUser){
        throw new ApiErrors(409,"Username or email already exists!");
    }

    // 4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage
    .length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // console.log("req.files", req.files);

    if(!avatarLocalPath){
        throw new ApiErrors(400,"Avatar is required");
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

const loginUser = asyncHandler(async (req,res)=>{
    // check email, username from req.body
    // find in db
    // if not throw not found
    // if found give refresh, access token in secure cookies

    const {username, email, password} = req.body;

    if(!username || !email){
        throw new ApiErrors(400,"email and username required");
    }

    const user = await User.findOne(
        {$or: [{username},{email}]}
    );

    if(!user){
        throw new ApiErrors(404,"User not found");
    }

    const isPasswordValid = user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiErrors(401,"invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // for cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            "User logged in successfully"
        )
    )
});

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    );

    // for cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200,{},"User logged out")
    )
});

export {registerUser, loginUser, logoutUser};