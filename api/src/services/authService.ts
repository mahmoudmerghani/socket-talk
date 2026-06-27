import type { UserSignupInput } from "@socket-talk/shared/schemas/userSchemas.js";
import * as userService from "./userService.js";
import { HttpError } from "../utils/HttpError.js";
import { hash } from "bcryptjs";

export async function signupUser(userData: UserSignupInput) {
    const exist =
        (await userService.getUserByEmail(userData.email)) ||
        (await userService.getUserByUsername(userData.username));

    if (exist) {
        throw new HttpError(409, "User already exists");
    }

    const hashedPassword = await hash(userData.password, 10);

    // this may error (excess property passwordConfirm)
    const user = await userService.createUser({
        ...userData,
        password: hashedPassword,
    });

    return user;
}
