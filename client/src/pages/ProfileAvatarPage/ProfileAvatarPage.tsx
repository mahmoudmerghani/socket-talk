import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Avatar } from "../../components/Avatar/Avatar";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import { api } from "../../api/api";
import "./ProfileAvatarPage.css";

function ErrorMessage({ message }: { message: string }) {
    return <p className="error-message">{message}</p>;
}

export function ProfileAvatarPage() {
    const navigate = useNavigate();
    const { user, setAuthenticatedUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!user) {
        return null;
    }

    const handleChooseImage = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedFile(file);
        setErrorMessage("");

        setPreviewUrl((currentPreviewUrl) => {
            if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl);
            }

            return URL.createObjectURL(file);
        });
    };

    const goHome = () => {
        navigate("/", { replace: true });
    };

    const handleContinue = async () => {
        if (!selectedFile) {
            goHome();
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        const formData = new FormData();
        formData.append("avatar", selectedFile);

        const response = await api("/users/me/avatar", {
            method: "PATCH",
            body: formData,
        });

        if ("error" in response) {
            setErrorMessage(response.error);
            setIsLoading(false);
            return;
        }

        setAuthenticatedUser({
            ...user,
            avatarUrl: response.publicUrl,
        });
        setIsLoading(false);
        navigate("/", { replace: true });
    };

    return (
        <section className="profile-avatar-page" aria-label="Choose avatar image">
            <div className="profile-avatar-page__brand">
                <BrandLogo />
            </div>

            <div className="profile-avatar-panel">
                {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

                <div className="profile-avatar-preview">
                    <Avatar
                        displayName={user.displayName}
                        avatarColor={user.avatarColor}
                        avatarUrl={previewUrl ?? user.avatarUrl}
                        size="6.5rem"
                    />
                </div>

                <h1>Choose your avatar</h1>
                <p className="profile-avatar-subtitle">
                    Add a face to your Socket Talk profile.
                </p>

                <input
                    ref={fileInputRef}
                    className="profile-avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                />

                <div className="profile-avatar-actions">
                    <button type="button" onClick={handleChooseImage} disabled={isLoading}>
                        Choose Image
                    </button>
                    <button
                        type="button"
                        className="profile-avatar-actions__secondary"
                        onClick={goHome}
                        disabled={isLoading}
                    >
                        Skip
                    </button>
                </div>

                {previewUrl ? (
                    <button
                        type="button"
                        className="profile-avatar-continue"
                        onClick={handleContinue}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Continue"}
                    </button>
                ) : null}
            </div>
        </section>
    );
}
