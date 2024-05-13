// Função para buscar e processar dados dos Pokémon
async function getPokemonTeam() {
    console.log("Função getPokemonTeam chamada");
    const pokemonInputs = document.querySelectorAll('.pokemon-input');
    const pokemonNames = Array.from(pokemonInputs).map(input => input.value);
  
    try {
      const promises = pokemonNames.map(name => fetchPokemonData(name));
      const pokemonDetails = await Promise.all(promises);
  
      let weaknessesSet = new Set();
      let resistancesSet = new Set();
      pokemonDetails.forEach(detail => {
        detail.weaknesses.forEach(weakness => weaknessesSet.add(weakness));
        detail.resistances.forEach(resistance => resistancesSet.add(resistance));
      });
  
      let weaknesses = Array.from(weaknessesSet);
      let resistances = Array.from(resistancesSet);
  
      weaknesses = weaknesses.filter(weakness => !resistances.includes(weakness));
      resistances = resistances.filter(resistance => !weaknesses.includes(resistance));
  
      console.log("Fraquezas da equipe (atualizadas):", weaknesses);
      console.log("Pontos fortes da equipe (atualizados):", resistances);
  
      // Atualizar a página com os resultados
      document.getElementById('weaknesses-list').innerHTML = weaknesses.map(weak => `<li>${weak}</li>`).join('');
      document.getElementById('resistances-list').innerHTML = resistances.map(res => `<li>${res}</li>`).join('');
    } catch (error) {
      console.error("Erro ao obter dados dos Pokémon:", error);
    }
  }
  
  // Função para buscar dados individuais de um Pokémon
  async function fetchPokemonData(pokemonName) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do Pokémon: ${response.statusText}`);
    }
    const pokemon = await response.json();
  
    // Buscar fraquezas e resistências baseadas nos tipos
    const types = pokemon.types.map(type => type.type.name);
    const typeResponses = await Promise.all(
      types.map(type => fetch(`https://pokeapi.co/api/v2/type/${type}`))
    );
  
    let weaknesses = [];
    let resistances = [];
    for (let typeResponse of typeResponses) {
      if (!typeResponse.ok) continue; // Ignore tipos que falharam na busca
      const typeData = await typeResponse.json();
      weaknesses = weaknesses.concat(typeData.damage_relations.double_damage_from.map(type => type.name));
      resistances = resistances.concat(typeData.damage_relations.half_damage_from.map(type => type.name));
    }
  
    return { weaknesses, resistances };
  }
  