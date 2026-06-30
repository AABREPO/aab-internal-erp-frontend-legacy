const EXPENSES_BILL_COPY_UPLOAD_URL = 'https://backendaab.in/demoAabuildersDash/api/files/upload';

export async function uploadExpensesEntryBillCopy(file, { siteName = '', vendor = '', contractor = '' } = {}) {
    if (!file) {
        throw new Error('No file selected');
    }

    const uploadFormData = new FormData();
    const timestamp = new Date()
        .toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        })
        .replace(',', '')
        .replace(/\s/g, '-');

    const finalName = `${timestamp}-${siteName}-${vendor || contractor}`;
    uploadFormData.append('files', file);
    uploadFormData.append('folder', 'FileUpload / Expenses_Entry_Files');
    uploadFormData.append('fileName', finalName);

    const uploadResponse = await fetch(EXPENSES_BILL_COPY_UPLOAD_URL, {
        method: 'POST',
        body: uploadFormData,
    });

    if (!uploadResponse.ok) {
        throw new Error('File upload failed');
    }

    const result = await uploadResponse.json();
    const url = result?.urls?.[0];
    if (!url) {
        throw new Error('File upload returned no URL');
    }
    return url;
}
