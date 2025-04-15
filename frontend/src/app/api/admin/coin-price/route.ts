import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Mevcut coin fiyatı API çağrısı başladı');
    
    // Kullanıcı kimliğini doğrula
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('Token bulunamadı');
      return NextResponse.json({ message: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    console.log('Backend API çağrısı yapılıyor');
    
    // Admin routes altındaki coin-price endpoint'ini kullan
    const apiUrl = 'http://localhost:8000/api/admin/coin-price';
    
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    console.log('API yanıt statusu:', response.status);
    
    if (!response.ok) {
      console.error('API yanıt hata:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        console.error('Hata detayları:', errorData);
        return NextResponse.json(
          { message: errorData.message || 'Mevcut coin fiyatı alınamadı' }, 
          { status: response.status }
        );
      } catch (jsonError) {
        console.error('Hata yanıtı JSON olarak ayrıştırılamadı', jsonError);
        return NextResponse.json(
          { message: 'Mevcut coin fiyatı alınamadı' }, 
          { status: response.status }
        );
      }
    }
    
    const data = await response.json();
    console.log('API yanıt başarılı, veri:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Mevcut coin fiyatı getirme hatası:', error);
    return NextResponse.json(
      { message: 'Mevcut coin fiyatı alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 