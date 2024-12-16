// src/utils/toast.js
import { useToast } from "vue-toastification";
import debounce from "lodash/debounce";

const toast = useToast();

const debouncedToast = (type, message) => {
    const showToast = debounce((msg) => {
        toast[type](msg);
    }, 2000, { leading: true, trailing: false });

    showToast(message);
};

export const showToast = {
    success: (message) => debouncedToast("success", message),
    error: (message) => debouncedToast("error", message),
    info: (message) => debouncedToast("info", message),
    warning: (message) => debouncedToast("warning", message),
};
