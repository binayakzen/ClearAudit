const { supabase } = require('./supabase');

async function clearData() {
    console.log('Clearing expenses data...');
    // Delete all records where id is not null (which means all records)
    const { data, error } = await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) {
        console.error('Error clearing data:', error);
    } else {
        console.log('Data cleared successfully.');
    }
}

clearData();
