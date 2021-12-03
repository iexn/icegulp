function getAppId(...ids) {
    return config.APP.ID + ids.join('_');
}
