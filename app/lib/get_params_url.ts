export const get_params_url = (name: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get(name);
    return result
}