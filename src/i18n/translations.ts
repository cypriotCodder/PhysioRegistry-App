export type Language = 'en' | 'tr';

export const translations = {
    en: {
        // Header
        appTitle: 'PhysioRegistry',
        patientList: 'Patient List',
        newPatient: 'New Patient',

        // Patient List
        searchPlaceholder: 'Search patients...',
        loading: 'Loading...',
        noPatientsFound: 'No patients found.',
        viewProfile: 'View Profile',
        dob: 'DOB',
        contact: 'Contact',

        // Registry Form (Common)
        dateOfBirth: 'Date of Birth',
        address: 'Address',
        diagnosis: 'Diagnosis / Chief Complaint',
        clinicalStory: 'Clinical Story',
        patientStory: 'Patient Story',

        // View Mode
        editProfile: 'Edit Profile',
        delete: 'Delete',
        noAddress: 'No address provided',
        confirmDelete: 'Are you sure you want to delete {name}? This cannot be undone.',

        // Edit Mode
        cancelEditing: 'Cancel Editing',
        editDetails: 'Edit Details',
        patientInfo: 'Patient Information',
        fullName: 'Full Name',
        fullNamePlaceholder: 'e.g. John Doe',
        contactPlaceholder: '+90 555 123 45 67',
        diagnosisPlaceholder: 'e.g. Lower Back Pain',
        addressPlaceholder: 'Full address...',
        saveRegistry: 'Save Registry',
        saving: 'Saving Registry...',

        // Messages
        saveSuccess: 'Patient saved successfully!',
        saveError: 'Failed to save: {error}',
        unexpectedError: 'An unexpected error occurred',
        deleteError: 'Error deleting patient',
        deleteSuccess: 'Patient deleted successfully',

        // Payment
        paymentHistory: 'Payment History',
        totalPaid: 'Total Paid',
        addPayment: 'Add Payment',
        amount: 'Amount',
        date: 'Date',
        description: 'Description',
        noPayments: 'No payments recorded',
        currency: '$', // Or whatever default
        deletePayment: 'Delete Payment',
        confirmDeletePayment: 'Are you sure you want to delete this payment?',

        // App Navigation
        editPatientProfile: 'Edit Patient Profile',
        newPatientRegistry: 'New Patient Registry',
        viewingRecord: 'Viewing record for {name}',
        enterDetails: 'Enter new details below.',
        createdAt: 'Created At',
        updatedAt: 'Last Updated',

        // Statistics
        statistics: 'Statistics',
        totalPatients: 'Total Patients',
        totalIncome: 'Total Income',
        averageIncome: 'Average Income per Patient',
        incomeOverTime: 'Income Over Time',
        daily: 'Daily',
        monthly: 'Monthly'
    },
    tr: {
        // Header
        appTitle: 'FizyoKayıt',
        patientList: 'Hasta Listesi',
        newPatient: 'Yeni Hasta',

        // Patient List
        searchPlaceholder: 'Hasta ara...',
        loading: 'Yükleniyor...',
        noPatientsFound: 'Hasta bulunamadı.',
        viewProfile: 'Profili Görüntüle',
        dob: 'Doğum Tarihi',
        contact: 'İletişim',

        // Registry Form (Common)
        dateOfBirth: 'Doğum Tarihi',
        address: 'Adres',
        diagnosis: 'Tanı / Şikayet',
        clinicalStory: 'Klinik Öyküsü',
        patientStory: 'Hasta Öyküsü',

        // View Mode
        editProfile: 'Profili Düzenle',
        delete: 'Sil',
        noAddress: 'Adres girilmedi',
        confirmDelete: '{name} isimli hastayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',

        // Edit Mode
        cancelEditing: 'Düzenlemeyi İptal Et',
        editDetails: 'Detayları Düzenle',
        patientInfo: 'Hasta Bilgileri',
        fullName: 'Ad Soyad',
        fullNamePlaceholder: 'örn. Hüseyin Dağdelen',
        contactPlaceholder: '+90 555 123 45 67',
        diagnosisPlaceholder: 'örn. Bel Ağrısı',
        addressPlaceholder: 'Tam adres...',
        saveRegistry: 'Kaydı Kaydet',
        saving: 'Kaydediliyor...',

        // Messages
        saveSuccess: 'Hasta başarıyla kaydedildi!',
        saveError: 'Kaydetme hatası: {error}',
        unexpectedError: 'Beklenmeyen bir hata oluştu',
        deleteError: 'Hasta silinirken hata oluştu',
        deleteSuccess: 'Hasta başarıyla silindi',

        // Payment
        paymentHistory: 'Ödeme Geçmişi',
        totalPaid: 'Toplam Ödenen',
        addPayment: 'Ödeme Ekle',
        amount: 'Miktar',
        date: 'Tarih',
        description: 'Açıklama',
        noPayments: 'Kayıtlı ödeme yok',
        currency: '₺',
        deletePayment: 'Ödemeyi Sil',
        confirmDeletePayment: 'Bu ödemeyi silmek istediğinize emin misiniz?',

        // App Navigation
        editPatientProfile: 'Hasta Profilini Düzenle',
        newPatientRegistry: 'Yeni Hasta Kaydı',
        viewingRecord: '{name} kaydı görüntüleniyor',
        enterDetails: 'Aşağıdaki bilgileri doldurun.',
        createdAt: 'Oluşturulma Tarihi',
        updatedAt: 'Son Güncelleme',

        // Statistics
        statistics: 'İstatistikler',
        totalPatients: 'Toplam Hasta',
        totalIncome: 'Toplam Gelir',
        averageIncome: 'Hasta Başına Ortalama Gelir',
        incomeOverTime: 'Zaman İçinde Gelir',
        daily: 'Günlük',
        monthly: 'Aylık'
    }
};
