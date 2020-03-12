import R from 'ramda';

export const getQuotaValueByCode = (quotas, code) => {
  const filters = R.filter((q) => q.quota && q.quota.codename === code, quotas);

  if(filters && filters.length > 0) {
    return parseInt(filters[0].value);
  }
  else {
    return 0;
  }
}

export const getQuotas = (userPlan, plans) => {
  if(userPlan && userPlan.id && plans) {
    const index = R.findIndex(R.propEq('id', userPlan.id))(plans);

    if(index !== undefined) {
      return plans[index].quotas;
    }
  }
  
  return [];
}

export const checkMaxProjects = (userPlan, plans, count) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'max_projects');
  if(limit == 0)
    return true;

  return limit > count;
}

export const checkMaxProjectTracks = (userPlan, plans, count) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'max_project_tracks');

  return limit > count;
}

export const checkMaxProjectArtworks = (userPlan, plans, count) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'max_project_artwork');

  return limit > count;
}

export const checkMaxVideoGenerations = (userPlan, plans, count) => {
  return true;
}

export const checkUnbrandedVideos = (userPlan, plans) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'unbranded_videos');

  return limit > 0;
}

export const checkVideoBranding = (userPlan, plans) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'video_branding');

  return limit > 0;
}

export const checkMaxImageUploadSize = (userPlan, plans, size) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'image_upload_data');
  
  return limit * 1024 * 1024 >= size;
}

export const checkMaxAudioUploadSize = (userPlan, plans, size) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'audio_upload_data');

  return limit * 1024 * 1024 >= size;
}

export const checkMaxConnectedAccounts = (userPlan, plans, count) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'max_connected_accounts');

  return limit > count;
}

export const checkAudioReactiveEffects = (userPlan, plans) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'audio_reactive_efx');

  return limit > 0;
}

export const checkVideoResolutions = (userPlan, plans, size) => {
  let limit = getQuotaValueByCode(getQuotas(userPlan, plans), 'video_resolutions');

  return limit >= size;
}
