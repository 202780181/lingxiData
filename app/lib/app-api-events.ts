export const APP_API_QUOTA_EXCEEDED_EVENT =
  "lingxi:app-api:quota-exceeded";
export const APP_MEMBERSHIP_UPGRADE_EVENT =
  "lingxi:membership-upgrade-requested";

export interface AppApiQuotaExceededEventDetail {
  code: "QUOTA_EXCEEDED";
  message: string;
  status: number;
  data: unknown;
}

export function dispatchQuotaExceededEvent({
  message,
  status,
  data,
}: Omit<AppApiQuotaExceededEventDetail, "code">) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AppApiQuotaExceededEventDetail>(
      APP_API_QUOTA_EXCEEDED_EVENT,
      {
        detail: {
          code: "QUOTA_EXCEEDED",
          message,
          status,
          data,
        },
      },
    ),
  );
}

export function dispatchMembershipUpgradeEvent(message?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<{ message?: string }>(APP_MEMBERSHIP_UPGRADE_EVENT, {
      detail: { message },
    }),
  );
}
