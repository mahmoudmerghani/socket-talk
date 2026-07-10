import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Avatar } from "../../components/Avatar/Avatar";
import { BrandLogo } from "../../components/BrandLogo/BrandLogo";
import "./ProfileAvatarPage.css";

export function ProfileAvatarPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    return (
        <section className="profile-avatar-page" aria-label="Choose avatar image">
            <div className="profile-avatar-page__brand">
                <BrandLogo />
            </div>

            <div className="profile-avatar-panel">
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
                />

                <div className="profile-avatar-actions">
                    <button type="button" onClick={handleChooseImage}>
                        Choose Image
                    </button>
                    <button
                        type="button"
                        className="profile-avatar-actions__secondary"
                        onClick={goHome}
                    >
                        Skip
                    </button>
                </div>

                {previewUrl ? (
                    <button
                        type="button"
                        className="profile-avatar-continue"
                        onClick={goHome}
                    >
                        Continue
                    </button>
                ) : null}
            </div>
        </section>
    );
}
