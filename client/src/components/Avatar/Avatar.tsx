import type { CSSProperties } from "react";
import "./Avatar.css";

type AvatarColor = string;

type AvatarBaseProps = {
    className?: string;
    size?: number | string;
};

type AvatarProps = AvatarBaseProps & {
    displayName: string;
    avatarColor: AvatarColor;
    avatarUrl?: string | null;
    alt?: string;
};

const AVATAR_COLOR_STYLES: Record<string, { background: string; color: string }> = {
    blue: {
        background: "#2f89c9",
        color: "#eaf7ff",
    },
    green: {
        background: "#2f9b78",
        color: "#ecfff8",
    },
    orange: {
        background: "#c7772f",
        color: "#fff4e7",
    },
    purple: {
        background: "#7d6ad1",
        color: "#f2efff",
    },
    red: {
        background: "#c65d67",
        color: "#fff0f2",
    },
};

const FALLBACK_COLOR = {
    background: "var(--surface-soft)",
    color: "var(--text)",
};

function getAvatarInitials(displayName: string) {
    const nameParts = displayName.trim().split(/\s+/).filter(Boolean);

    if (nameParts.length === 0) {
        return "?";
    }

    if (nameParts.length === 1) {
        return Array.from(nameParts[0]!).slice(0, 2).join("").toUpperCase();
    }

    return `${Array.from(nameParts[0]!)[0] ?? ""}${Array.from(nameParts.at(-1)!)[0] ?? ""}`.toUpperCase();
}

function getAvatarSize(size: AvatarProps["size"]) {
    if (typeof size === "number") {
        return `${size}px`;
    }

    return size ?? "2.5rem";
}

export function Avatar(props: AvatarProps) {
    const className = props.className ? `avatar ${props.className}` : "avatar";
    const style = {
        "--avatar-size": getAvatarSize(props.size),
    } as CSSProperties;

    if (props.avatarUrl) {
        return (
            <span className={className} style={style}>
                <img
                    src={props.avatarUrl}
                    alt={props.alt ?? props.displayName}
                    className="avatar__image"
                />
            </span>
        );
    }

    const color = AVATAR_COLOR_STYLES[props.avatarColor] ?? FALLBACK_COLOR;
    const initials = getAvatarInitials(props.displayName);

    return (
        <span
            className={className}
            style={
                {
                    ...style,
                    "--avatar-bg": color.background,
                    "--avatar-fg": color.color,
                } as CSSProperties
            }
            aria-label={props.alt ?? props.displayName}
            title={props.displayName}
        >
            <span className="avatar__initials" aria-hidden="true">
                {initials}
            </span>
        </span>
    );
}

export type { AvatarColor, AvatarProps };
