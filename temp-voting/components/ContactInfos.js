function ContactInfos({ props, translationsForLanguage, juryEvent, handleContactDatas, contactDatas, setContactDatas, contactStatutList }) {
  const [countries, setCountries] = useState([]);
  const [newPhoto, setNewPhoto] = useState(null);

  const getCountries = () => {
    fetch('https://www.myglobalvillage.com/api/?action=getCountries')
      .then(response => response.json())
      .then(data => {
        setCountries(data);
      });
  };

  const updateContactFiles = async (e) => {
    e.preventDefault();
    const field = e.target.name;
    const value = e.target.files[0];

    setNewPhoto(URL.createObjectURL(value)); // Get file preview

    setContactDatas({ ...contactDatas, [field]: value });

    const formData = new FormData();
    formData.append('photo', value);
    formData.append('id_contact', contactDatas.id_contact);

    await fetch(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=updateContactVisuel`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(result => {
        console.log(result);
      });
  };

  const updateContact = async (e) => {
    e.preventDefault();
    const field = e.target.name;
    const value = e.target.value;

    setContactDatas({ ...contactDatas, [field]: value });

    const data = {
      formData: { [field]: value, id_contact: contactDatas.id_contact }
    };

    await fetch(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=updateContact`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => {
        console.log(result);
      });
  };

  const statutOptions = [
    { id: 79, label: "I am an investor and want to access to the investors deck of the startup" },
    { id: 77, label: "I am a business developer or a tech retailor and could distribute the international expansion strategy of the showcase innovative solutions." },
    { id: 80, label: "I am a end user or a decision maker and could use or buy the solution showcased on stage" },
    { id: 82, label: "I am a media or an influencor and would like to receive press release about the solution showcased" },
    { id: 75, label: "I am a tech provider that could partner with the solution on stage please connect me" },
    { id: 84, label: "I am territory or an accelerator and like to offer a welcome pack to my ecosystem to the showcased solution" }
  ];

  useEffect(() => {
    console.log(contactDatas);
    getCountries();
  }, [contactDatas]);

  return (
    <section className=" max-w-4xl mx-auto">
      {/* Header Alert - Styled for Modern Look */}
      <div className="bg-gray-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-8">
        <h2 className="text-xl font-semibold">{translationsForLanguage.titre}</h2>
        <p className="text-sm text-gray-600 mt-1">{translationsForLanguage.soustitre}</p>
      </div>


      {
        // Affiche l'alerte si AU MOINS UN des champs obligatoires est vide
        (
          !contactDatas.prenom.trim() ||
          !contactDatas.nom.trim() ||
          !contactDatas.mail.trim() ||
          !contactDatas.societe.trim() ||
          !contactDatas.pays.trim()
        ) && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-3 mb-5">
            Veuillez renseigner les champs obligatoires pour passer à l'étape suivante
          </div>
        )
      }

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        {/* Photo Upload */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="photo" className="block text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/4">
            Photo
          </label>
          <div className="flex-1">
            <input
              type="file"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              name="photo"
              id="photo"
              required
              onChange={updateContactFiles}
            />
            <small className="text-gray-500 text-xs mt-1 block">Upload your photo</small>

            <div className="mt-4 flex space-x-4">
              {newPhoto && <img src={newPhoto} alt="New" className="object-cover w-24 h-24 rounded-full border border-gray-200" />}
              {contactDatas.photos && contactDatas.photos.small && contactDatas.photos.small !== '' && !newPhoto &&
                <img src={contactDatas.photos.small} alt="Contact" className="object-cover w-24 h-24 rounded-full border border-gray-200" />
              }
              {(!contactDatas.photos || !contactDatas.photos.small) && !newPhoto &&
                <img src="https://www.event2one.com/images/avatars/avatar.png" alt="Default Avatar" className="object-cover w-24 h-24 rounded-full border border-gray-200" />
              }
            </div>
          </div>
        </div>

        {/* Input Fields */}
        {[
          { id: 'mail', label: 'E-mail', type: 'email', required: true, value: contactDatas.mail },
          { id: 'port', label: translationsForLanguage.mobile, type: 'text', required: false, value: contactDatas.port },
          { id: 'prenom', label: translationsForLanguage.prenom, type: 'text', required: true, value: contactDatas.prenom },
          { id: 'nom', label: translationsForLanguage.nom, type: 'text', required: true, value: contactDatas.nom },
          { id: 'societe', label: translationsForLanguage.societe, type: 'text', required: true, value: contactDatas.societe },
          { id: 'web', label: translationsForLanguage.web, type: 'text', required: false, value: contactDatas.web }
        ].map((field, index) => (
          <div key={index} className="mb-6 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor={field.id} className="block text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/4">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex-1">
              <input
                type={field.type}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                name={field.id}
                id={field.id}
                placeholder={field.label}
                required={field.required}
                value={field.value || ''}
                onChange={updateContact}
              />
            </div>
          </div>
        ))}

        {/* Country Select */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="pays" className="block text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/4">
            {translationsForLanguage.pays} <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <select
              id="pays"
              name="pays"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={updateContact}
              value={contactDatas.pays || ''}
            >
              <option value="">Select your country</option>
              {countries
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((country, index) => (
                  <option key={index} value={country.value}>
                    {country.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Status Select */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="id_statut" className="block text-gray-700 font-medium mb-2 sm:mb-0 sm:w-1/4">
            {translationsForLanguage.status}
          </label>
          <div className="flex-1">
            <select
              id="id_statut"
              name="id_statut"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={handleContactDatas}
              value={contactStatutList.length > 0 ? contactStatutList[0].id_statut : ''}
            >
              <option value="">{translationsForLanguage.status}</option>
              {statutOptions.map((option, index) => (
                <option key={index} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-8 text-green-600 text-sm italic">
          {translationsForLanguage.endMessage}
        </p>
      </div>
    </section>
  );
}
